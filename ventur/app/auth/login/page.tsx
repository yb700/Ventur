// app/auth/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Mail, Lock, LogIn, Target, ArrowLeft } from 'lucide-react';

/**
 * Modern login page component.
 * Handles user sign-in using Supabase auth with beautiful UI.
 */
export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        console.log('Attempting login for:', email);

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            console.error('Login error:', signInError);
            setError(signInError.message);
            setLoading(false);
        } else {
            console.log('Login successful for user:', data.user?.id);
            // Let the middleware handle the routing based on onboarding status
            router.push('/portal');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex">
            {/* Background Spotlights */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Left Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Back to Home */}
                    <button
                        onClick={() => router.push('/')}
                        className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-8 transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </button>

                    {/* Login Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-8">
                        {/* Logo and Header */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Target className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl blur opacity-20"></div>
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    LOREM
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                            <p className="text-gray-600">Sign in to your account</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <div className="flex items-center gap-2 text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSignIn} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <LogIn className="w-5 h-5 mr-2" />
                                        Sign In
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">New to LOREM?</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <Link
                            href="/auth/register"
                            className="w-full block text-center border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-purple-300 hover:text-purple-600 transition-all duration-300 cursor-pointer"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Open Space */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/80">
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                            <LogIn className="w-16 h-16 text-white/60" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Welcome to LOREM</h1>
                        <p className="text-xl opacity-80 max-w-md">
                            Connect with marketing opportunities and grow your business with intelligent data monitoring.
                        </p>
                    </div>
                </div>

                {/* Additional decorative elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>
            </div>
        </div>
    );
}
