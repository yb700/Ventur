/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/portal/PortalSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import {
    LayoutDashboard,
    Target,
    Folder,
    PenSquare,
    Send,
    History,
    Settings,
    LogOut,
    CreditCard,
    Building,
    User,
    Menu,
    ChevronRight,
    Sun,
    Moon,
    Monitor,
    Palette
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { Database } from '@/types/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

type Profile = Database['public']['Tables']['profiles']['Row'];

const navLinks = [
    {
        href: '/portal/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Overview of your applications'
    },
    {
        href: '/portal/applications',
        label: 'Saved Apps',
        icon: Folder,
        description: 'Your saved planning applications'
    },
    {
        href: '/portal/templates',
        label: 'Templates',
        icon: PenSquare,
        description: 'Letter templates and designs'
    },
    {
        href: '/portal/send',
        label: 'Send Letter',
        icon: Send,
        description: 'Send letters to applications'
    },
    {
        href: '/portal/balance',
        label: 'Balance',
        icon: CreditCard,
        description: 'Manage your account balance'
    },
    {
        href: '/portal/history',
        label: 'History',
        icon: History,
        description: 'View transaction history'
    },
];

const bottomLinks = [
    {
        href: '/portal/settings',
        label: 'Settings',
        icon: Settings,
        description: 'Account and app settings'
    }
];

// Helper to format currency
const formatCurrency = (amountCents: number) => {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(amountCents / 100);
};

// Helper to get company initial or user initial
const getProfileInitial = (profile: Profile | null, user: any) => {
    if (profile?.company_name) {
        return profile.company_name.charAt(0).toUpperCase();
    }
    if (profile?.full_name) {
        return profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
        return user.email.split('@')[0].slice(0, 2).toUpperCase();
    }
    return 'U';
};

// Helper to get theme icon
const getThemeIcon = (theme: string) => {
    switch (theme) {
        case 'light':
            return <Sun className="w-4 h-4" />;
        case 'dark':
            return <Moon className="w-4 h-4" />;
        default:
            return <Monitor className="w-4 h-4" />;
    }
};

// Helper to get theme label
const getThemeLabel = (theme: string) => {
    switch (theme) {
        case 'light':
            return 'Light Mode';
        case 'dark':
            return 'Dark Mode';
        default:
            return 'Theme';
    }
};

export default function PortalSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, cycleTheme, isDarkMode } = useTheme();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
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
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    const handleTopUp = () => {
        router.push('/portal/balance');
    };

    const isActiveLink = (href: string) => {
        if (href === '/portal/dashboard') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    if (loading) {
        return (
            <div className="drawer-side z-40">
                <label htmlFor="sidebar-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <aside className="bg-base-100 w-64 min-h-full flex flex-col">
                    <div className="h-16 flex items-center justify-center border-b border-base-300">
                        <div className="skeleton h-8 w-32"></div>
                    </div>
                    <div className="flex-grow p-4">
                        <div className="space-y-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="skeleton h-10 w-full"></div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        );
    }

    return (
        <div className="drawer-side z-40">
            <label htmlFor="sidebar-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <aside className={`bg-base-100 min-h-full flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                {/* Logo Section with Mobile Toggle */}
                <div className="h-16 flex items-center justify-between border-b border-base-300 px-4">
                    <Link href="/portal/dashboard" className="flex items-center gap-2">
                        {!isCollapsed && (
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                LOREM
                            </span>
                        )}
                    </Link>
                    <div className="flex items-center gap-2">
                        {/* Mobile Menu Toggle */}
                        <label htmlFor="sidebar-drawer" aria-label="close sidebar" className="btn btn-ghost btn-sm lg:hidden">
                            <Menu className="w-4 h-4" />
                        </label>
                        {/* Desktop Collapse Toggle */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="btn btn-ghost btn-sm hidden lg:flex hover:bg-gray-100"
                        >
                            <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Navigation Menu */}
                <ul className="menu w-full p-4 flex-grow">
                    {navLinks.map(link => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`group ${isActiveLink(link.href) ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? link.label : undefined}
                            >
                                <link.icon className="w-4 h-4" />
                                {!isCollapsed && (
                                    <>
                                        <span>{link.label}</span>
                                        <div className="tooltip z-[1000] tooltip-right" data-tip={link.description}>
                                            <div className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Bottom Section */}
                <ul className="menu p-4 border-t w-full border-base-300">
                    {bottomLinks.map(link => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`${isActiveLink(link.href) ? 'active' : ''} ${isCollapsed ? 'justify-center' : ''}`}
                                title={isCollapsed ? link.label : undefined}
                            >
                                <link.icon className="w-4 h-4" />
                                {!isCollapsed && (
                                    <>
                                        <span>{link.label}</span>
                                        <div className="tooltip tooltip-right" data-tip={link.description}>
                                            <div className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Link>
                        </li>
                    ))}

                    {/* Enhanced Theme Toggle */}
                    <li>
                        <button
                            onClick={cycleTheme}
                            className={`${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? `Current: ${getThemeLabel(theme)}` : undefined}
                        >
                            {getThemeIcon(theme)}
                            {!isCollapsed && (
                                <>
                                    <span>{getThemeLabel(theme)}</span>
                                    <div className="tooltip tooltip-right" data-tip={`Switch theme (current: ${getThemeLabel(theme)})`}>
                                        <div className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </button>
                    </li>

                    <li>
                        <a
                            onClick={handleLogout}
                            className={`text-error hover:text-error ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? 'Logout' : undefined}
                        >
                            <LogOut className="w-4 h-4" />
                            {!isCollapsed && <span>Logout</span>}
                        </a>
                    </li>
                </ul>

                {/* Profile and Balance Section */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-base-300 space-y-4">
                        {/* Balance Display */}
                        <div className="bg-base-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-base-content/60">Balance</span>
                                <CreditCard className="w-4 h-4 text-success" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-lg">{formatCurrency(balance)}</span>
                                <button
                                    onClick={handleTopUp}
                                    className="btn btn-primary btn-xs"
                                >
                                    Top Up
                                </button>
                            </div>
                        </div>

                        {/* Profile Section */}
                        <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                {profile?.logo_url ? (
                                    <Image
                                        src={profile.logo_url}
                                        alt="Company Logo"
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-primary font-bold text-lg">
                                        {getProfileInitial(profile, user)}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate">
                                    {profile?.full_name || 'User'}
                                </div>
                                {profile?.company_name && (
                                    <div className="text-xs text-base-content/60 flex items-center gap-1 truncate">
                                        <Building className="w-3 h-3" />
                                        {profile.company_name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Collapsed Profile Avatar */}
                {isCollapsed && (
                    <div className="p-4 border-t border-base-300">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                {profile?.logo_url ? (
                                    <Image
                                        src={profile.logo_url}
                                        alt="Company Logo"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-primary font-bold text-sm">
                                        {getProfileInitial(profile, user)}
                                    </span>
                                )}
                            </div>
                            <div className="text-center">
                                <div className="text-xs font-bold">{formatCurrency(balance)}</div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Toggle Button for Collapsed Sidebar */}
            {isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="fixed left-4 top-20 z-50 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white"
                    title="Expand sidebar"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            )}
        </div>
    );
}
