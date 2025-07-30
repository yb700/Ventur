// app/api/create-checkout-session/route.ts

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set');
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-06-30.basil',
});

export async function POST(request: Request) {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('STRIPE_SECRET_KEY is not configured');
        return NextResponse.json(
            { error: 'Payment service is not configured. Please contact support.' },
            { status: 500 }
        );
    }

    // server‑side Supabase client (reads cookies under the hood)
    const supabase = await createClient();

    // Revalidate the Auth token by fetching the user every time
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { name, amount } = await request.json();
    if (!name || !amount) {
        return NextResponse.json(
            { error: 'Price ID and quantity are required.' },
            { status: 400 }
        );
    }

    try {
        const successUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal/payment/success`;
        const cancelUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/portal/payment/cancelled`;

        // Create a Stripe Checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: name,         // e.g. "£5 Top‑Up"
                    },
                    unit_amount: amount,  // e.g. 500 for £5.00
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { userId: user.id },
        });

        if (!checkoutSession.url) {
            throw new Error("Could not create Stripe Checkout session.");
        }

        // Return the session URL to redirect the client
        return new NextResponse(JSON.stringify({ url: checkoutSession.url }), { status: 200 });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return new NextResponse(JSON.stringify({ error: 'An internal server error occurred.' }), { status: 500 });
    }
}
