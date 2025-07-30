// app/auth/reset-password/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client'; // Ensure this path is correct
import { Lock, KeyRound, CheckCircle } from 'lucide-react';

/**
 * Reset Password page component.
 * Handles the final step of updating the user's password after they click the reset link.
 */
export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);

    // Supabase triggers a 'PASSWORD_RECOVERY' event when the user lands on this page
    // from a valid reset link. We listen for this to confirm the user is allowed to proceed.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true);
            }
        });

        // Check initial session in case the event was missed on fast load
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            // A temporary session exists during password recovery
            if (data.session) {
                setIsValidSession(true);
            }
        };
        checkSession();


        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handlePasswordUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        // --- Supabase Password Update ---
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
            // Optional: Automatically sign the user out to force a fresh login
            await supabase.auth.signOut();
            // Redirect to login after a short delay
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        }

        setLoading(false);
    };

    if (!isValidSession && !success) {
        return (
            <div className="w-full max-w-md text-center">
                <div className="card bg-base-100 shadow-xl w-full">
                    <div className="card-body items-center">
                        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
                        <p>Verifying reset token...</p>
                        <p className="text-xs text-base-content/60 mt-2">If you did not click a link in an email, please close this page.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md">
            <div className="card bg-base-100 shadow-xl w-full">
                <div className="card-body">
                    <div className="text-center mb-4">
                        <KeyRound className="w-12 h-12 mx-auto text-primary" />
                        <h2 className="card-title justify-center mt-2 text-2xl font-bold">
                            Set New Password
                        </h2>
                    </div>

                    {/* --- Success Message --- */}
                    {success && (
                        <div role="alert" className="alert alert-success">
                            <CheckCircle className="stroke-current shrink-0 h-6 w-6" />
                            <div>
                                <h3 className="font-bold">Password Updated!</h3>
                                <div className="text-xs">You will be redirected to the login page shortly.</div>
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

                    {/* --- Update Form --- */}
                    {!success && (
                        <form onSubmit={handlePasswordUpdate}>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">New Password</span>
                                </label>
                                <label className="input input-bordered flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-base-content/40" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="grow"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Confirm New Password</span>
                                </label>
                                <label className="input input-bordered flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-base-content/40" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="grow"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                            <div className="form-control mt-6">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <span className="loading loading-spinner"></span> : "Update Password"}
                                </button>
                            </div>
                        </form>
                    )}

                    {success && (
                        <Link href="/auth/login" className="btn btn-ghost w-full mt-4">
                            Login Now
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
