// app/portal/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

export default function PortalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserAndRedirect = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    router.replace('/auth/login');
                    return;
                }

                // Check if user has completed onboarding
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('onboarding_complete')
                    .eq('id', user.id)
                    .single();

                if (error && error.code === 'PGRST116') {
                    // No profile - redirect to onboarding
                    router.replace('/portal/onboarding');
                } else if (profile && !profile.onboarding_complete) {
                    // Profile exists but onboarding not complete
                    router.replace('/portal/onboarding');
                } else {
                    // Onboarding complete - redirect to dashboard
                    router.replace('/portal/dashboard');
                }
            } catch (error) {
                console.error('Error checking user status:', error);
                router.replace('/auth/login');
            } finally {
                setLoading(false);
            }
        };

        checkUserAndRedirect();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                    <p className="mt-4 text-base-content/60">Loading...</p>
                </div>
            </div>
        );
    }

    return null;
} 