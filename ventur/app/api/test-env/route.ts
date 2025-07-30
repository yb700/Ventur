import { NextResponse } from 'next/server';

export async function GET() {
    const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL
    };

    return NextResponse.json({
        success: true,
        environment: envVars,
        timestamp: new Date().toISOString()
    });
} 