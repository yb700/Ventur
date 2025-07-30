// app/auth/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Authentication - Planning Tracker",
    description: "Sign up or log in to your Planning Tracker account.",
};

/**
 * Layout for all authentication pages.
 * Centers content and provides a consistent header.
 */
export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex flex-col bg-base-200">
            <main className="">
                {children}
            </main>
            <footer className="footer footer-center p-4 text-base-content/60 text-sm">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
                </aside>
            </footer>
        </div>
    );
}
