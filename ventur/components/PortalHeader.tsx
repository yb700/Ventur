// components/portal/PortalHeader.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Menu, CreditCard, Settings, LogOut, Building } from 'lucide-react';
import type { Database } from '@/types/supabase';
import Image from 'next/image';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Helper to format currency
const formatCurrency = (amountCents: number) => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(amountCents / 100);
};

// Helper to get company initial or user initial
const getProfileInitial = (profile: Profile | null, user: User | null) => {
    if (profile?.company_name) {
        return profile.company_name.charAt(0).toUpperCase();
    }
    if (profile?.full_name) {
        return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
        return user.email.split('@')[0].slice(0, 2).toUpperCase();
    }
    return 'U';
};

export default function PortalHeader() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                setUser(currentUser);

                // Fetch profile and balance in parallel
                const [profileRes, balanceRes] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUser.id)
                        .single(),
                    supabase
                        .from('user_balances')
                        .select('balance')
                        .eq('user_id', currentUser.id)
                        .single()
                ]);

                if (profileRes.data) {
                    setProfile(profileRes.data);
                }

                if (balanceRes.data) {
                    setBalance(balanceRes.data.balance);
                } else if (balanceRes.error && balanceRes.error.code !== 'PGRST116') {
                    console.error("Error fetching balance:", balanceRes.error);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleTopUp = () => {
        router.push('/portal/balance');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <header className="navbar bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
            {/* Mobile Sidebar Toggle */}
            <div className="flex-none lg:hidden">
                <label htmlFor="sidebar-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
                    <Menu className="w-5 h-5" />
                </label>
            </div>

            <div className="flex-1">
                {/* Page title or breadcrumbs can go here */}
            </div>

            <div className="flex gap-6">
                {/* Balance Display */}
                <div className="hidden sm:flex items-center gap-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-2 border border-purple-200/50">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-sm text-gray-700">{formatCurrency(balance)}</span>
                    <button
                        onClick={handleTopUp}
                        className="btn btn-primary btn-xs bg-gradient-to-r from-purple-600 to-indigo-600 border-0 hover:shadow-lg hover:shadow-purple-500/25"
                    >
                        Top Up
                    </button>
                </div>

                {/* User Profile Section */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="flex items-center gap-3 hover:bg-gray-100 rounded-xl px-3 py-2 cursor-pointer transition-colors">
                        <div className="flex flex-col items-end text-right">
                            <span className="font-semibold text-sm text-gray-900">
                                {profile?.full_name || 'User'}
                            </span>
                            {profile?.company_name && (
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    {profile.company_name}
                                </span>
                            )}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center border-2 border-purple-200">
                            {profile?.logo_url ? (
                                <Image
                                    src={profile.logo_url}
                                    alt="Company Logo"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-purple-600 font-bold text-lg">
                                    {getProfileInitial(profile, user)}
                                </span>
                            )}
                        </div>
                    </div>
                    <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-white rounded-xl w-56 border border-gray-200">
                        <li className="p-3 border-b border-gray-200">
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-gray-900">
                                    {profile?.full_name || 'User'}
                                </span>
                                {profile?.company_name && (
                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                        <Building className="w-3 h-3" />
                                        {profile.company_name}
                                    </span>
                                )}
                                <span className="text-xs text-gray-500 mt-1">
                                    {user?.email}
                                </span>
                            </div>
                        </li>
                        <li>
                            <a
                                onClick={() => router.push('/portal/settings')}
                                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </a>
                        </li>
                        <li>
                            <a
                                onClick={handleTopUp}
                                className="flex items-center gap-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                            >
                                <CreditCard className="w-4 h-4" />
                                Manage Balance
                            </a>
                        </li>
                        <li className="border-t border-gray-200 mt-2 pt-2">
                            <a
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}