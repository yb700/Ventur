# Stripe Webhook Setup Guide

## Overview
This application now uses Stripe webhooks to properly handle payment completion and add transactions to the database. This ensures that:

1. **Balance updates only happen after successful payments**
2. **Transaction history is properly recorded**
3. **Failed payments are tracked**
4. **No duplicate charges or balance updates**

## Setup Instructions

### 1. Environment Variables
Add the following environment variable to your `.env.local` file:

```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Stripe Dashboard Configuration

#### Step 1: Create Webhook Endpoint
1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-domain.com/api/webhooks/stripe`
   - For local development: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
4. Select the following events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"

#### Step 2: Get Webhook Secret
1. After creating the endpoint, click on it to view details
2. Click "Reveal" next to "Signing secret"
3. Copy the `whsec_` secret and add it to your environment variables

### 3. Testing the Webhook

#### Local Development
1. Use [ngrok](https://ngrok.com/) to expose your local server:
   ```bash
   ngrok http 3000
   ```
2. Update your webhook endpoint URL in Stripe dashboard with the ngrok URL
3. Test a payment and check your server logs for webhook events

#### Production
1. Deploy your application
2. Update the webhook endpoint URL to your production domain
3. Test with a small payment amount

### 4. How It Works

#### Payment Flow
1. User clicks "Top Up" → Creates Stripe checkout session
2. User completes payment on Stripe
3. Stripe sends `checkout.session.completed` webhook
4. Webhook handler:
   - Creates transaction record in database
   - Updates user balance
   - Logs the successful payment

#### Failed Payment Flow
1. Payment fails on Stripe
2. Stripe sends `payment_intent.payment_failed` webhook
3. Webhook handler creates failed transaction record
4. Balance remains unchanged

### 5. Database Schema
The webhook uses these database tables:

```sql
-- Transactions table
transactions (
  id: string,
  user_id: string,
  type: string,           -- 'TOP_UP', 'LETTER_FEE', etc.
  amount: number,         -- Amount in cents
  status: string,         -- 'COMPLETED', 'FAILED', etc.
  stripechargeid: string, -- Stripe payment intent ID
  letterid: string,       -- Optional: for letter-related transactions
  createdat: timestamp
)

-- User balances table
user_balances (
  user_id: string,
  balance: number,        -- Current balance in cents
  last_top_up_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp
)
```

### 6. Troubleshooting

#### Common Issues
1. **Webhook not receiving events**: Check endpoint URL and ensure it's accessible
2. **Signature verification failed**: Verify `STRIPE_WEBHOOK_SECRET` is correct
3. **Database errors**: Check Supabase connection and table permissions
4. **Balance not updating**: Check webhook logs for errors

#### Debugging
- Check your server logs for webhook events
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Monitor webhook delivery in Stripe Dashboard

### 7. Security Notes
- Never expose your webhook secret in client-side code
- Always verify webhook signatures (already implemented)
- Use HTTPS in production
- Monitor webhook failures and retry logic

## Benefits of This Approach
- ✅ **Reliable**: Payments only update balance when actually completed
- ✅ **Auditable**: Complete transaction history
- ✅ **Secure**: Webhook signature verification
- ✅ **Scalable**: Handles multiple payment types
- ✅ **Maintainable**: Clear separation of concerns 