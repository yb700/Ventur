/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/send/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import {
    ArrowLeft,
    Check,
    ChevronRight,
    CreditCard,
    FileText,
    Loader2,
    Send,
    AlertTriangle,
} from "lucide-react";
import { Database } from "@/types/supabase";

type Application = Database["public"]["Tables"]["applications"]["Row"];
type LetterTemplate = Database["public"]["Tables"]["user_templates"]["Row"];
type Balance = Database["public"]["Tables"]["user_balances"]["Row"];

interface BucketItem {
    id: string;
    application: Application;
}

const COST_PER_LETTER_CENTS = 75;
const formatCurrency = (amountCents: number) =>
    new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
    }).format(amountCents / 100);

export default function SendLetterPage() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, setUser] = useState<User | null>(null);
    const [step, setStep] = useState(1);

    const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
    const [templates, setTemplates] = useState<LetterTemplate[]>([]);
    const [balance, setBalance] = useState<Balance | undefined>();
    const [dataLoading, setDataLoading] = useState(true);

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [selectedItems, setSelectedItems] = useState<Map<string, boolean>>(new Map());

    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<{ message: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return router.push("/auth/login");
            setUser(currentUser);

            // Fetch user bucket, templates, and balance
            const [bucketRes, templatesRes, balanceRes] = await Promise.all([
                supabase
                    .from("buckets")
                    .select("id, bucket_applications(application_id, applications(*))")
                    .eq("user_id", currentUser.id)
                    .limit(1)
                    .single(),
                supabase.from("user_templates").select("*").eq("user_id", currentUser.id),
                supabase.from("user_balances").select("*").eq("user_id", currentUser.id).single(),
            ]);

            if (bucketRes.data?.bucket_applications) {
                const items = bucketRes.data.bucket_applications
                    .filter((ba: any) => ba.applications)
                    .map((ba: any) => ({
                        id: ba.application_id,
                        application: ba.applications,
                    })) as BucketItem[];
                setBucketItems(items);
                setSelectedItems(new Map(items.map((item) => [item.id, true])));
            }

            if (templatesRes.data) {
                setTemplates(templatesRes.data);
                if (templatesRes.data.length > 0) {
                    setSelectedTemplateId(templatesRes.data[0].id);
                }
            }

            if (balanceRes.data) {
                setBalance(balanceRes.data);
            }

            setDataLoading(false);
        };

        fetchData();
    }, [router]);

    const selectedItemsCount = useMemo(() => {
        return Array.from(selectedItems.values()).filter(Boolean).length;
    }, [selectedItems]);

    const totalCost = selectedItemsCount * COST_PER_LETTER_CENTS;
    const hasSufficientBalance = (balance?.balance ?? 0) >= totalCost;

    const handleToggleItem = (id: string) => {
        const newSelection = new Map(selectedItems);
        newSelection.set(id, !newSelection.get(id));
        setSelectedItems(newSelection);
    };

    const handleProceedToPreview = () => {
        if (!selectedTemplateId || selectedItemsCount === 0) {
            alert("Please select a template and at least one application.");
            return;
        }
        setStep(2);
    };

    const handleSend = async () => {
        if (!hasSufficientBalance) return;
        setProcessing(true);

        const bucketItemIds = Array.from(selectedItems.entries())
            .filter(([, selected]) => selected)
            .map(([id]) => id);

        try {
            const response = await fetch("/api/send-letters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ templateId: selectedTemplateId, bucketItemIds }),
            });

            const res = await response.json();

            if (!response.ok) throw new Error(res.error || "Unknown error");

            setResult({ message: res.message, type: "success" });
        } catch (error: any) {
            setResult({ message: error.message, type: "error" });
        } finally {
            setProcessing(false);
            setStep(3);
        }
    };

    if (dataLoading) {
        return (
            <div className="flex justify-center items-center h-96">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    return (
        <div>
            <ul className="steps w-full mb-8">
                <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Select Items</li>
                <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Preview & Confirm</li>
                <li className={`step ${step >= 3 ? "step-primary" : ""}`}>Done</li>
            </ul>

            {/* Step 1: Select */}
            {step === 1 && (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title">Step 1: Choose Template and Applications</h2>
                        <div className="form-control w-full max-w-xs">
                            <label className="label"><span className="label-text">Select a Letter Template</span></label>
                            <select
                                className="select select-bordered"
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                            >
                                <option disabled value="">Pick one</option>
                                {templates.map((t) => (
                                    <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="divider">Select Applications</div>
                        <div className="overflow-x-auto max-h-96">
                            <table className="table table-pin-rows">
                                <tbody>
                                    {bucketItems.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-primary"
                                                        checked={selectedItems.get(item.id) || false}
                                                        onChange={() => handleToggleItem(item.id)}
                                                    />
                                                    <div>
                                                        <div className="font-bold">{item.application.address}</div>
                                                        <div className="text-sm opacity-50">{item.application.reference}</div>
                                                    </div>
                                                </label>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="card-actions justify-end mt-4">
                            <button
                                className="btn btn-primary"
                                onClick={handleProceedToPreview}
                                disabled={!selectedTemplateId || selectedItemsCount === 0}
                            >
                                Proceed to Preview <ChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body">
                        <h2 className="card-title">Step 2: Preview and Confirm</h2>
                        <div className="alert alert-info"><FileText /><span>Sending <strong>{selectedItemsCount}</strong> letters.</span></div>
                        <div className="alert alert-warning"><CreditCard /><span>Total: <strong>{formatCurrency(totalCost)}</strong>. Balance: <strong>{formatCurrency(balance!.balance)}</strong>.</span></div>
                        {!hasSufficientBalance && (
                            <div className="alert alert-error"><AlertTriangle /><span>Insufficient balance. Please top up.</span></div>
                        )}
                        <div className="card-actions justify-between mt-4">
                            <button className="btn btn-ghost" onClick={() => setStep(1)}><ArrowLeft /> Back</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSend}
                                disabled={!hasSufficientBalance || processing}
                            >
                                {processing ? <Loader2 className="animate-spin" /> : <Send />}
                                {processing ? "Processing..." : "Confirm & Send"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Done */}
            {step === 3 && result && (
                <div className="card bg-base-100 shadow-sm">
                    <div className="card-body items-center text-center">
                        {result.type === "success" ? (
                            <Check className="w-16 h-16 text-success mb-4" />
                        ) : (
                            <AlertTriangle className="w-16 h-16 text-error mb-4" />
                        )}
                        <h2 className="card-title">{result.type === "success" ? "Success!" : "Error"}</h2>
                        <p>{result.message}</p>
                        <div className="card-actions mt-4">
                            <button className="btn btn-primary" onClick={() => router.push("/portal/history")}>View History</button>
                            <button className="btn btn-ghost" onClick={() => router.push("/portal/dashboard")}>Go to Dashboard</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}