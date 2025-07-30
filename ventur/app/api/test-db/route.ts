import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Test basic connection
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
            return NextResponse.json({ error: 'Auth error', details: userError }, { status: 500 });
        }

        // Test profiles table
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (profilesError) {
            return NextResponse.json({
                error: 'Profiles table error',
                details: profilesError,
                user: user ? { id: user.id, email: user.email } : null
            }, { status: 500 });
        }

        // Test buckets table
        const { data: buckets, error: bucketsError } = await supabase
            .from('buckets')
            .select('*')
            .limit(1);

        if (bucketsError) {
            return NextResponse.json({
                error: 'Buckets table error',
                details: bucketsError,
                user: user ? { id: user.id, email: user.email } : null
            }, { status: 500 });
        }

        // Test user_balances table
        const { data: balances, error: balancesError } = await supabase
            .from('user_balances')
            .select('*')
            .limit(1);

        if (balancesError) {
            return NextResponse.json({
                error: 'User balances table error',
                details: balancesError,
                user: user ? { id: user.id, email: user.email } : null
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            user: user ? { id: user.id, email: user.email } : null,
            tables: {
                profiles: profiles?.length || 0,
                buckets: buckets?.length || 0,
                user_balances: balances?.length || 0
            }
        });

    } catch (error) {
        return NextResponse.json({
            error: 'Unexpected error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 