/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/balance/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { History, PlusCircle, CreditCard, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

// Define your Stripe Price IDs here. These should be created in your Stripe Dashboard.
const TOP_UP_OPTIONS = [
    { name: '£5 Top‑Up', priceId: 'price_1KnABCDEfGhIJkLmNOPq', amount: 500, popular: false },
    { name: '£10 Top‑Up', priceId: 'price_1KnQRSTUvWxYZabcDEFg', amount: 1000, popular: true },
    { name: '£20 Top‑Up', priceId: 'price_1KnHIJkLmNOPqRSTUaVw', amount: 2000, popular: false },
    { name: '£50 Top‑Up', priceId: 'price_1KnHIJkLmNOPqRSTUaVw2', amount: 5000, popular: false },
];

type Transaction = {
    id: string;
    createdat: string;
    type: string;
    amount: number;
    status: string;
    description?: string;
};

const formatCurrency = (amountCents: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amountCents / 100);

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
            return <CheckCircle className="w-4 h-4 text-success" />;
        case 'pending':
            return <Clock className="w-4 h-4 text-warning" />;
        case 'failed':
        case 'cancelled':
            return <XCircle className="w-4 h-4 text-error" />;
        default:
            return <Clock className="w-4 h-4 text-base-content/40" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
            return 'badge-success';
        case 'pending':
            return 'badge-warning';
        case 'failed':
        case 'cancelled':
            return 'badge-error';
        default:
            return 'badge-ghost';
    }
};

export default function BalancePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) {
                router.push('/auth/login');
                return;
            }
            setUser(currentUser);

            const [balanceRes, transactionsRes] = await Promise.all([
                supabase.from('user_balances').select('balance').eq('user_id', currentUser.id).single(),
                supabase.from('transactions').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(50)
            ]);

            if (balanceRes.data) setBalance(balanceRes.data.balance);
            if (transactionsRes.data) setTransactions(transactionsRes.data);

            setLoading(false);
        };
        fetchData();
    }, [router]);

    const handleTopUp = async (name: string, amount: number) => {
        setIsRedirecting(true);
        setSelectedAmount(amount);
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, amount: amount }),
            });

            const { url, error } = await response.json();

            if (error) throw new Error(error);
            if (url) {
                window.location.href = url; // Redirect to Stripe
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
            setIsRedirecting(false);
            setSelectedAmount(null);
        }
    };

    const getTransactionDescription = (transaction: Transaction) => {
        if (transaction.type === 'TOP_UP') {
            return 'Account top-up';
        } else if (transaction.type === 'LETTER_SENT') {
            return 'Letter sent via Stannp';
        } else if (transaction.type === 'REFUND') {
            return 'Refund processed';
        }
        return transaction.description || 'Transaction';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                    <p className="text-base-content/60">Loading your balance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Balance & Payments</h1>
                    <p className="text-base-content/70">
                        Manage your account balance and view transaction history
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance & Top-Up */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Current Balance Card */}
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body items-center text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <CreditCard className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="card-title text-lg text-base-content/70 mb-2">Current Balance</h2>
                            <p className="text-5xl font-bold my-4">{formatCurrency(balance)}</p>

                            {/* Balance Status */}
                            <div className="flex items-center gap-2 mb-4">
                                {balance > 1000 ? (
                                    <div className="flex items-center gap-1 text-success">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm">Good balance</span>
                                    </div>
                                ) : balance > 500 ? (
                                    <div className="flex items-center gap-1 text-warning">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">Low balance</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-error">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">Very low balance</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Up Options */}
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <h3 className="card-title text-lg mb-4">Top Up Your Balance</h3>
                            <p className="text-sm text-base-content/60 mb-6">
                                Add funds to your account to send letters. Each letter costs £0.75.
                            </p>

                            <div className="space-y-3">
                                {TOP_UP_OPTIONS.map(option => (
                                    <button
                                        key={option.priceId}
                                        className={`btn w-full justify-between ${option.popular
                                            ? 'btn-primary'
                                            : 'btn-outline'
                                            } ${isRedirecting && selectedAmount === option.amount
                                                ? 'loading'
                                                : ''
                                            }`}
                                        onClick={() => handleTopUp(option.name, option.amount)}
                                        disabled={isRedirecting}
                                    >
                                        <div className="flex items-center gap-2">
                                            <PlusCircle className="w-4 h-4" />
                                            <span>{option.name}</span>
                                            {option.popular && (
                                                <span className="badge badge-secondary badge-sm">Popular</span>
                                            )}
                                        </div>
                                        <span className="font-semibold">{formatCurrency(option.amount)}</span>
                                    </button>
                                ))}
                            </div>

                            {isRedirecting && (
                                <div className="mt-4 text-center">
                                    <div className="loading loading-dots loading-md"></div>
                                    <p className="text-sm text-base-content/60 mt-2">Redirecting to payment...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="card-title">
                                    <History className="w-6 h-6" />
                                    Transaction History
                                </h2>
                                <div className="badge badge-primary">{transactions.length}</div>
                            </div>

                            {transactions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Description</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(tx => (
                                                <tr key={tx.id} className="hover">
                                                    <td>
                                                        <div className="text-sm font-medium">
                                                            {new Date(tx.createdat).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs text-base-content/60">
                                                            {new Date(tx.createdat).toLocaleTimeString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="font-medium">
                                                            {getTransactionDescription(tx)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-sm ${tx.type === 'TOP_UP' ? 'badge-success' : 'badge-warning'} badge-outline`}>
                                                            {tx.type.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={`font-semibold ${tx.amount > 0 ? 'text-success' : 'text-error'
                                                            }`}>
                                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(tx.status)}
                                                            <span className={`badge badge-sm ${getStatusColor(tx.status)}`}>
                                                                {tx.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <History className="w-8 h-8 text-base-content/40" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">No transactions yet</h3>
                                    <p className="text-base-content/60 mb-4">
                                        Your transaction history will appear here once you make your first top-up or send letters.
                                    </p>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setSelectedAmount(TOP_UP_OPTIONS[1].amount)}
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Make Your First Top-Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="card bg-base-200 border border-base-300">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-sm">1</span>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Top Up Your Balance</h4>
                                <p className="text-sm text-base-content/60">
                                    Add funds to your account using our secure payment system
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-sm">2</span>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Send Letters</h4>
                                <p className="text-sm text-base-content/60">
                                    Each letter costs £0.75 and is automatically deducted from your balance
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-sm">3</span>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Track Spending</h4>
                                <p className="text-sm text-base-content/60">
                                    Monitor all your transactions and letter costs in real-time
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
