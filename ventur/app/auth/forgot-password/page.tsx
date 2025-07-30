// app/auth/forgot-password/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client'; // Ensure this path is correct
import { Mail, Send, HelpCircle } from 'lucide-react';

/**
 * Forgot Password page component.
 * Handles sending a password reset link via Supabase auth.
 */
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        // --- Supabase Password Reset Request ---
        // We must provide a redirectTo URL where the user will be sent after clicking the link in their email.
        // This URL must be added to your Supabase project's allow-list.
        // Go to: Authentication -> URL Configuration -> Site URL / Additional Redirect URLs
        const redirectTo = `${window.location.origin}/auth/reset-password`;

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (resetError) {
            setError(resetError.message);
        } else {
            // On success, we don't leak whether the user exists.
            // We show a generic success message.
            setSuccess(true);
        }

        setLoading(false);
    };

    return (
        <div className="w-full max-w-md">
            <div className="card bg-base-100 shadow-xl w-full">
                <div className="card-body">
                    <div className="text-center mb-4">
                        <HelpCircle className="w-12 h-12 mx-auto text-primary" />
                        <h2 className="card-title justify-center mt-2 text-2xl font-bold">
                            Forgot Password?
                        </h2>
                        <p className="text-sm text-base-content/70 mt-1">
                            No problem. Enter your email below and we&apos;ll send you a link to reset it.
                        </p>
                    </div>

                    {/* --- Success Message --- */}
                    {success && (
                        <div role="alert" className="alert alert-success">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <h3 className="font-bold">Check your inbox!</h3>
                                <div className="text-xs">If an account with that email exists, we&apos;ve sent a password reset link to it.</div>
                            </div>
                        </div>
                    )}

                    {/* --- Error Message --- */}
                    {error && (
                        <div role="alert" className="alert alert-error">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* --- Reset Form --- */}
                    {!success && (
                        <form onSubmit={handlePasswordReset}>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Your Email</span>
                                </label>
                                <label className="input input-bordered flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-base-content/40" />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="grow"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                            <div className="form-control mt-6">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <span className="loading loading-spinner"></span> : "Send Reset Link"}
                                    {!loading && <Send className="w-4 h-4 ml-2" />}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="divider text-sm">Remembered it?</div>

                    <Link href="/auth/login" className="btn btn-ghost w-full">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
