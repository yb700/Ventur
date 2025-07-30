// app/(portal)/payment/success/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
    const router = useRouter();

    // Redirect user to their balance page after a short delay
    useEffect(() => {
        setTimeout(() => {
            router.push('/portal/balance');
            router.refresh(); // Force a refresh to show updated balance
        }, 3000);
    }, [router]);

    return (
        <div className="card bg-base-100 shadow-sm max-w-lg mx-auto">
            <div className="card-body items-center text-center">
                <CheckCircle className="w-16 h-16 text-success mb-4" />
                <h2 className="card-title">Payment Successful!</h2>
                <p>Thank you for your top-up. Your balance is being updated.</p>
                <p className="flex items-center gap-2 mt-4">
                    <Loader2 className="animate-spin" />
                    Redirecting you back to the balance page...
                </p>
            </div>
        </div>
    );
}