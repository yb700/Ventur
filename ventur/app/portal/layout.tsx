// app/(portal)/layout.tsx
"use client";

import PortalSidebar from "@/components/PortalSidebar";
import { Menu } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Main layout for the authenticated user portal.
 * Includes a persistent sidebar with profile and balance at the bottom.
 */
export default function PortalLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { theme } = useTheme();

    return (
        <div className="drawer lg:drawer-open min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50" data-theme={theme}>
            <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />

            {/* Background Spotlights */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
            </div>

            {/* Sidebar Component */}
            <PortalSidebar />

            <div className="drawer-content flex flex-col relative">
                {/* Mobile Menu Toggle */}
                <div className="lg:hidden p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
                    <label htmlFor="sidebar-drawer" className="btn btn-ghost btn-square hover:bg-gray-100">
                        <Menu className="w-5 h-5" />
                    </label>
                </div>

                {/* Page Content */}
                <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
