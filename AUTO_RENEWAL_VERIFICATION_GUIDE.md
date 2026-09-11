# AgeWellRI — How to Immediately Test MONTHLY Auto-Renewal

This guide provides 3 quick methods to immediately test and verify the **MONTHLY Renewal & Next Quarter Visit Scheduling** flow without waiting 3 months.

---

## Method 1: Instant Automated Test Suite (Recommended — Takes 3 Seconds)

The backend includes a comprehensive 20-scenario test suite that tests the entire renewal lifecycle, visit allocation rollover, unscheduled count calculation, and email dispatch.

### Run Command:

Open a terminal and run:

```powershell
cd c:\Rubel\age-well-ri-backend
npx tsx src/modules/payment/MONTHLY-renewal.test.ts
```

### What It Tests:

- ✅ **Scenario 1**: Provisions Quarter 2 period with correct visit allocations (6 Safety + 6 Cleaning).
- ✅ **Scenario 2**: Confirms **0 random appointments are auto-scheduled** upon renewal (visits stay unscheduled until client/admin books them).
- ✅ **Scenario 3**: Verifies scheduling against the new quarter decreases remaining count accurately.
- ✅ **Scenario 4**: Verifies unscheduled visit count is correctly calculated for the client scheduling banner.
- ✅ **Scenario 5**: Confirms Quarter 1 historical records are preserved untouched.
- ✅ **Scenario 6**: Dispatches the official **MONTHLY Renewal Active Email** to the member.

---

## Method 2: Live Database Simulation for an Existing Client

To simulate renewal for a real client in your database and verify it immediately on the UI:

### 1. Run the Renewal Simulation Script:

Run the following command in your backend directory:

```powershell
cd c:\Rubel\age-well-ri-backend
npx tsx -e "
import prisma from './src/lib/prisma';
import { handleStripeInvoicePaid } from './src/modules/payment/payment.service';

async function testRenewal() {
  const sub = await prisma.subscription.findFirst({
    where: { status: 'ACTIVE' },
    include: { client: { include: { user: true } }, plan: true }
  });
  if (!sub) {
    console.log('No active subscription found.');
    return;
  }
  console.log('Testing renewal for client:', sub.client?.user?.email);

  // Simulate Stripe invoice.paid renewal webhook
  await handleStripeInvoicePaid({
    id: 'in_test_renewal_' + Date.now(),
    customer: sub.stripeCustomerId,
    subscription: sub.stripeSubscriptionId,
    billing_reason: 'subscription_cycle',
    amount_paid: sub.planPrice ? sub.planPrice * 100 : 24900,
    lines: {
      data: [{
        period: {
          start: Math.floor(Date.now() / 1000),
          end: Math.floor((Date.now() + 90 * 86400000) / 1000)
        }
      }]
    }
  });
  console.log('✅ Renewal completed! Check UI dashboard.');
}
testRenewal();
"
```

---

## Method 3: Live Stripe CLI Webhook Trigger

If you are using Stripe CLI locally:

1. **Start Stripe Webhook Forwarding**:

   ```powershell
   stripe listen --forward-to localhost:5173/api/v1/payments/stripe-webhook
   ```

2. **Trigger the Renewal Webhook**:
   ```powershell
   stripe trigger invoice.paid
   ```

---

## How to Verify on the UI After Renewal

1. **Client Portal (`http://localhost:3000/dashboard`)**:
   - You will see the **Blue Action Banner**:
     > 🌟 **Your New Service Quarter Is Active!**  
     > You have **X new visits** available to schedule for this quarter.
   - Click **"Schedule Next Visit"** to book visits using the new quarter's quota.

2. **Admin Client Details (`http://localhost:3000/admin/clients/[id]`)**:
   - Go to the **Entitlements / Visits Tab**:
     - Quarter 1 (Previous) shows **Completed (6/6)**.
     - Quarter 2 (Current) shows **Available (6 Remaining, 0 Scheduled)**.

3. **Email Logs**:
   - Check the terminal console for:
     ```
     🎉 [EMAIL SERVICE] MONTHLY Renewal Active Email dispatched to: member@example.com
     ```
