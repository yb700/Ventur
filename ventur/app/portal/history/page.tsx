/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(portal)/history/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Database } from '@/types/supabase';

type TransactionRow = Database['public']['Tables']['transactions']['Row'];
type LetterRow = Database['public']['Tables']['letters']['Row'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];

type TransactionWithRelations = TransactionRow & {
    letters: (LetterRow & {
        applications: ApplicationRow | null;
    }) | null;
};

const ITEMS_PER_PAGE = 15;

const formatCurrency = (amountCents: number) =>
    new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(amountCents / 100);

export default function HistoryPage() {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchHistory = useCallback(async (currentUser: User, pageNumber: number) => {
        setLoading(true);
        try {
            const from = (pageNumber - 1) * ITEMS_PER_PAGE;
            const to = from + ITEMS_PER_PAGE - 1;

            const { count, error: countError } = await supabase
                .from('transactions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);

            if (countError) throw countError;
            setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));

            const { data, error } = await supabase
                .from('transactions')
                .select(`
          id,
          createdat,
          type,
          amount,
          status,
          letters (
            id,
            application_id,
            applications (
              reference
            )
          )
        `)
                .eq('user_id', currentUser.id)
                .order('createdat', { ascending: false })
                .range(from, to) as unknown as {
                    data: TransactionWithRelations[];
                    error: any;
                };

            if (error) throw error;
            setTransactions(data || []);
        } catch (error: any) {
            console.error("Failed to fetch transaction history:", error.message || error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                setUser(currentUser);
                fetchHistory(currentUser, page);
            } else {
                router.push('/auth/login');
            }
        };
        init();
    }, [router, fetchHistory, page]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Transaction History</h1>

            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    // Skeleton loader
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i}>
                                            <td><div className="skeleton h-4 w-32"></div></td>
                                            <td><div className="skeleton h-4 w-48"></div></td>
                                            <td><div className="skeleton h-4 w-20"></div></td>
                                            <td><div className="skeleton h-4 w-16"></div></td>
                                        </tr>
                                    ))
                                ) : transactions.length > 0 ? (
                                    transactions.map(tx => (
                                        <tr key={tx.id} className="hover">
                                            <td>{new Date(tx.createdat).toLocaleString('en-GB')}</td>
                                            <td>
                                                {tx.type === 'TOP_UP' ? 'Balance Top-Up' : `Letter Fee: Ref ${tx.letters?.applications?.reference || 'N/A'}`}
                                            </td>
                                            <td className={`${tx.amount >= 0 ? 'text-success' : 'text-error'} font-semibold`}>
                                                {formatCurrency(tx.amount)}
                                            </td>
                                            <td>
                                                <span className="badge badge-ghost">{tx.status}</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="text-center p-8">No transactions found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="card-actions justify-center mt-6">
                            <div className="join">
                                <button
                                    className="join-item btn"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page <= 1}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <button className="join-item btn">
                                    Page {page} of {totalPages}
                                </button>
                                <button
                                    className="join-item btn"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page >= totalPages}
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
