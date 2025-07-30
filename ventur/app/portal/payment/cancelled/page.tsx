// app/(portal)/payment/cancelled/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

export default function PaymentCancelledPage() {
    const router = useRouter();

    return (
        <div className="card bg-base-100 shadow-sm max-w-lg mx-auto">
            <div className="card-body items-center text-center">
                <AlertTriangle className="w-16 h-16 text-warning mb-4" />
                <h2 className="card-title">Payment Cancelled</h2>
                <p>Your payment process was cancelled. You have not been charged.</p>
                <div className="card-actions mt-4">
                    <button className="btn btn-primary" onClick={() => router.push('/portal/balance')}>
                        Back to Balance
                    </button>
                </div>
            </div>
        </div>
    );
}
