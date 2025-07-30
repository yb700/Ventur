/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;

                // Only process if this is a payment (not a subscription)
                if (session.mode === 'payment' && session.payment_status === 'paid') {
                    const userId = session.metadata?.userId;
                    const amount = session.amount_total; // Amount in cents

                    if (!userId || !amount) {
                        console.error('Missing userId or amount in session metadata');
                        return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
                    }

                    // Add transaction record
                    const { error: transactionError } = await supabase
                        .from('transactions')
                        .insert({
                            user_id: userId,
                            type: 'TOP_UP',
                            amount: amount,
                            status: 'COMPLETED',
                            stripechargeid: session.payment_intent as string,
                            createdat: new Date().toISOString(),
                        });

                    if (transactionError) {
                        console.error('Error creating transaction:', transactionError);
                        return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
                    }

                    // Update user balance
                    const { data: existingBalance, error: fetchError } = await supabase
                        .from('user_balances')
                        .select('balance')
                        .eq('user_id', userId)
                        .single();

                    if (fetchError && fetchError.code !== 'PGRST116') {
                        console.error('Error fetching balance:', fetchError);
                        return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
                    }

                    const currentBalance = existingBalance?.balance ?? 0;
                    const newBalance = currentBalance + amount;

                    const { error: balanceError } = await supabase
                        .from('user_balances')
                        .upsert({
                            user_id: userId,
                            balance: newBalance,
                            last_top_up_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        }, { onConflict: 'user_id' });

                    if (balanceError) {
                        console.error('Error updating balance:', balanceError);
                        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
                    }

                    console.log(`Successfully processed payment for user ${userId}: £${amount / 100}`);
                }
                break;

            case 'payment_intent.payment_failed':
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const failedUserId = paymentIntent.metadata?.userId;

                if (failedUserId) {
                    // Add failed transaction record
                    const { error: failedTransactionError } = await supabase
                        .from('transactions')
                        .insert({
                            user_id: failedUserId,
                            type: 'TOP_UP',
                            amount: paymentIntent.amount,
                            status: 'FAILED',
                            stripechargeid: paymentIntent.id,
                            createdat: new Date().toISOString(),
                        });

                    if (failedTransactionError) {
                        console.error('Error creating failed transaction:', failedTransactionError);
                    }
                }
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
} 