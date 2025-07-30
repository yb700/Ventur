import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            return NextResponse.json({ error: 'Auth error', details: userError }, { status: 500 });
        }

        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 401 });
        }

        console.log('Debug: Checking profile for user:', user.id);

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.log('Debug: Profile error:', profileError);

            if (profileError.code === 'PGRST116') {
                // No profile exists - create one
                console.log('Debug: Creating profile for user:', user.id);

                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        full_name: null,
                        company_name: null,
                        address: null,
                        email: user.email,
                        onboarding_complete: false,
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('Debug: Error creating profile:', createError);
                    return NextResponse.json({
                        error: 'Failed to create profile',
                        details: createError
                    }, { status: 500 });
                }

                console.log('Debug: Profile created successfully:', newProfile);

                // Create initial bucket
                const { error: bucketError } = await supabase
                    .from('buckets')
                    .insert({
                        user_id: user.id,
                        title: 'My Applications',
                        description: 'Default bucket for saved applications'
                    });

                if (bucketError) {
                    console.error('Debug: Error creating bucket:', bucketError);
                } else {
                    console.log('Debug: Bucket created successfully');
                }

                // Initialize balance
                const { error: balanceError } = await supabase
                    .from('user_balances')
                    .insert({
                        user_id: user.id,
                        balance: 0
                    });

                if (balanceError) {
                    console.error('Debug: Error creating balance:', balanceError);
                } else {
                    console.log('Debug: Balance initialized successfully');
                }

                return NextResponse.json({
                    success: true,
                    action: 'profile_created',
                    user: { id: user.id, email: user.email },
                    profile: newProfile
                });
            } else {
                return NextResponse.json({
                    error: 'Profile query error',
                    details: profileError
                }, { status: 500 });
            }
        } else {
            console.log('Debug: Profile found:', profile);
            return NextResponse.json({
                success: true,
                action: 'profile_exists',
                user: { id: user.id, email: user.email },
                profile: profile
            });
        }

    } catch (error) {
        console.error('Debug: Unexpected error:', error);
        return NextResponse.json({
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 