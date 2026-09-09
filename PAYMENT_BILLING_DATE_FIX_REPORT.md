# PAYMENT_BILLING_DATE_FIX_REPORT.md
**Authoritative Technical Audit & Implementation Report: First Billing Date & Early Stripe Charge Prevention**

**Date:** September 9, 2026  
**System:** AgeWellRI Membership & Billing Platform  
**Target Timezone:** `America/New_York` (US Eastern Time)

---

## 1. Existing Billing Workflow Discovered

During our audit of the AgeWellRI codebase across backend and frontend, the onboarding and billing lifecycle operated as follows:

1. **Client Registration & Agreement**:
   - Client signs up, completes the multi-step Client Service Agreement, and proceeds to the payment step.
2. **Payment Method Collection**:
   - The frontend loads Stripe Elements via a `SetupIntent` (`processAgreementPayment` / `createSetupIntent`).
   - The card is saved off-session to the client's Stripe Customer record (`stripePaymentMethodId`).
3. **Stripe Subscription Creation**:
   - The backend created a Stripe Subscription with a `trial_end` timestamp intended to delay the initial billing to the following month.
4. **Local Database Records**:
   - Local records were created for `Subscription`, `SubscriptionPeriod`, `Invoice`, and `Payment`.
5. **Entitlements & Scheduling**:
   - Visit allocations and appointment capabilities were evaluated against active periods and subscriptions.

---

## 2. Exact Reason Payment Was Occurring on the 30th

### The Core Root Cause: UTC Midnight Offset vs. `America/New_York` Timezone
When creating the first billing date for a September 9 signup:
1. **JavaScript Midnight UTC Generation**:
   The date calculation created a date representing the 1st of the following month at `00:00:00.000` UTC:
   ```ts
   // Generated: 2026-10-01T00:00:00.000Z (Epoch: 1790812800)
   ```
2. **Stripe & Local Timezone Conversion in Eastern Time (`America/New_York`)**:
   - AgeWellRI operates in Rhode Island (`America/New_York`, UTC-4 during Daylight Saving Time / EDT).
   - In `America/New_York`, `2026-10-01T00:00:00.000Z` is **September 30, 2026, at 8:00:00 PM EDT** (4 hours behind UTC).
   - When the Unix epoch seconds (`1790812800`) were supplied to Stripe as `trial_end`, Stripe's billing engine in `America/New_York` evaluated the trial expiration at **September 30, 2026, 8:00 PM EDT**.
   - Consequently:
     - Stripe scheduled trial completion and invoice finalization for **September 30**.
     - Stripe's webhook fired `invoice.paid` on **September 30**.
     - Stripe generated an invoice dated **September 30**.
     - Frontend date formatters in US Eastern Time rendered `September 30, 2026`.

### Root Cause Comparison:
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ BEFORE (The September 30 Bug):                                                          │
│ Reference Signup Date: September 9, 2026                                               │
│ Generated UTC Date:    2026-10-01T00:00:00.000Z                                         │
│ In America/New_York:   September 30, 2026, 8:00:00 PM EDT (UTC-4)                      │
│ Sent to Stripe:        trial_end = 1790812800                                          │
│ Stripe Billing Engine: Charges at 8:00 PM EDT on SEPTEMBER 30!                         │
│ Formatted Display:     "September 30, 2026"                                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ AFTER (Guaranteed October 1 Fix):                                                      │
│ Reference Signup Date: September 9, 2026                                               │
│ Generated UTC Date:    2026-10-01T12:00:00.000Z (Noon UTC)                             │
│ In America/New_York:   October 1, 2026, 8:00:00 AM EDT (UTC-4)                          │
│ In America/Los_Angeles:October 1, 2026, 5:00:00 AM PDT (UTC-7)                          │
│ Sent to Stripe:        trial_end = 1790856000                                          │
│ Stripe Billing Engine: Charges at 8:00 AM EDT on OCTOBER 1!                            │
│ Formatted Display:     "October 1, 2026"                                               │
│ Guard Protection:      isChargeAllowed checks Eastern calendar day (now.day >= 1)      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stripe Configuration Discovered

- **Customer**: Created with client metadata (`userId`, `clientId`, `clientNumber`).
- **SetupIntent**: Configured for `usage: "off_session"` to save credit cards with 3D Secure support without charging.
- **Subscription**: Configured with dynamic `price_data` matching the active `PlanPrice` / `PlanVersion` from the database.
- **Trial Anchor**: Uses `trial_end` to delay the initial recurring invoice until the target first billing date.
- **Proration Behavior**: Configured as `proration_behavior: "none"`.

---

## 4. Backend Root Cause

1. **Timezone Offset Regression**: Calculating midnight without timezone anchoring allowed UTC negative offsets (-4h EDT, -5h EST, -7h PDT) to shift October 1 back to September 30.
2. **Missing Pre-Charge Guard**: No backend validation existed in direct charge endpoints (`adminRetryCharge`) to verify `isChargeAllowed(firstBillingDate)` before executing a Stripe `PaymentIntent`.
3. **Premature Status Provisioning**: Onboarding was historically creating `ACTIVE` status before the 1st of the month payment confirmed.

---

## 5. Frontend Root Cause

1. **Client-side Timestamp Formatting**: The client portal formatted raw ISO strings without specifying `timeZone: "America/New_York"`, leading to local browser timezone shifts.
2. **Static Labeling**: Some views previously displayed current period dates rather than differentiating pending first billing from active cycles.

---

## 6. Date Calculation Before vs. After

### BEFORE:
```ts
// Local JavaScript Date Constructor (unanchored):
const nextMonthFirst = new Date(year, month + 1, 1, 0, 0, 0, 0);
// In UTC: 2026-10-01T00:00:00.000Z -> In New York: 2026-09-30 20:00:00 EDT
```

### AFTER:
```ts
// Authoritative Timezone-Aware Eastern Date Calculation:
export function getFirstBillingDate(referenceDate: Date = new Date()): Date {
  const { year, month } = getEasternDateParts(referenceDate);

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const monthStr = String(nextMonth).padStart(2, "0");
  // Anchored at 12:00:00 UTC (8:00 AM EDT / 7:00 AM EST in America/New_York)
  return new Date(`${nextYear}-${monthStr}-01T12:00:00.000Z`);
}
```

---

## 7. Stripe Billing Configuration Before vs. After

### BEFORE:
```ts
trial_end: Math.floor(new Date(year, month + 1, 1).getTime() / 1000)
// Evaluated to Sep 30 8:00 PM EDT in Stripe
```

### AFTER:
```ts
trial_end: getStripeTrialEndTimestamp(now)
// Evaluates to Oct 1 8:00 AM EDT (12:00:00 UTC) in Stripe
```

---

## 8. Files Changed

### Backend:
1. `src/utils/billing-dates.util.ts`:
   - Authoritative date calculation utility with `America/New_York` timezone normalization.
   - Functions: `getEasternDateParts`, `getFirstBillingDate`, `getServiceCommencementDate`, `getStripeTrialEndTimestamp`, `isChargeAllowed`, `calculatePeriodEndDate`, `getReminderDate`, `getCancellationCutoffDate`, `isWithinCancellationCutoff`, `formatBillingDate`.
2. `src/utils/billing-dates.test.ts`:
   - 15 comprehensive unit test cases covering all edge cases (leap years, year rollovers, early charge blocking, reminders, cutoffs).
3. `src/modules/payment/payment.service.ts`:
   - Enforced $0 signup with Stripe `trial_end` anchored to 12:00:00 UTC on the 1st of the next month.
   - Subscription created with `status: PENDING`.
   - Initial invoice created with `status: DRAFT` / `OPEN` due on the 1st.
   - Eliminated premature `PAID` payments and premature visit allocations at signup.
   - Guarded `adminRetryCharge` with `isChargeAllowed(invoice.dueDate)`.
   - Updated webhook `invoice.paid` to activate Period 1 and provision `VisitAllocation` only upon actual Stripe payment confirmation.
   - Updated `cancelSubscriptionRenewal` with 10-day cutoff and Stripe `cancel_at_period_end: true`.
   - Updated `getBillingOverview` to return `firstBillingDate`, `serviceCommencementDate`, `cancellationCutoffDate`, `isPendingFirstBilling`.
4. `src/modules/payment/scheduler.service.ts`:
   - Updated renewal reminder threshold strictly to 15 days with `BillingNotificationLog` deduplication.
5. `src/modules/appointment/appointment.service.ts`:
   - Added validation blocking appointment booking if subscription is `PENDING` or appointment date is prior to `serviceCommencementDate`.

### Frontend:
1. `redux/features/payment/paymentTypes.ts`:
   - Added `firstBillingDate`, `serviceCommencementDate`, `cancellationCutoffDate`, `isPendingFirstBilling` to `BillingOverviewData`.
2. `components/dashboard/billing-card.tsx`:
   - Added zero-charge signup banner, dynamic commencement & cutoff dates, and modal integration.
3. `components/dashboard/cancel-renewal-modal.tsx`:
   - Added 10-day cutoff policy notice and `cancellationCutoffDate` prop.

---

## 9. Database Changes

- **No Destructive Schema Migrations Required**: Reused existing Prisma models (`Subscription`, `SubscriptionPeriod`, `Invoice`, `Payment`, `VisitAllocation`, `BillingNotificationLog`, `StripeWebhookEvent`, `AuditLog`).
- Preserved all existing relations, historical payments, and client records.

---

## 10. Webhook Changes

- **`invoice.paid`**:
  - Authoritative event that transitions `Subscription` from `PENDING` to `ACTIVE`.
  - Creates Period 1 (or increments period number).
  - Provisions `VisitAllocation` records idempotently.
  - Creates local `PAID` Payment record linked to Stripe invoice.
  - Dispatches Payment Success Receipt and Renewal Active emails.
- **`customer.subscription.deleted`**:
  - Marks local subscription `CANCELLED` and `autoRenew: false`.
  - Records cancellation in audit log.
- **`invoice.payment_failed`**:
  - Updates subscription to `PAYMENT_FAILED` and alerts admin and client.

---

## 11. Cron / Scheduler Changes

- **`checkAndSendRenewalReminders`**:
  - Checks subscriptions where `nextRenewalDate` is exactly within the 15-day notice window (`daysUntilRenewal <= 15`).
  - Checks `BillingNotificationLog` to prevent duplicate reminders.
  - Does NOT create charges (charges are handled authoritatively by Stripe Subscriptions on the 1st).

---

## 12. First Payment & Service Commencement Lifecycle

```
SIGNUP TODAY (e.g. September 9)
  │
  ├─► Agreement Executed ($0 charged)
  ├─► Stripe Customer & SetupIntent created
  ├─► Card saved off-session
  ├─► First Billing Date = October 1, 2026 (12:00 UTC / 8:00 AM EDT)
  ├─► Service Commencement Date = October 1, 2026
  ├─► Stripe Subscription created with trial_end = October 1, 2026
  ├─► Local Subscription = PENDING
  ├─► Local Invoice = DRAFT (Due October 1)
  ├─► Visit Allocations = 0 (Not provisioned yet)
  └─► Scheduling prior to October 1 = BLOCKED

WAIT UNTIL OCTOBER 1
  │
  ├─► September 16: 15-Day Renewal Reminder email sent
  ├─► September 30: Backend blocks any premature charge attempt
  │
OCTOBER 1 ARRIVES
  │
  ├─► Stripe charges saved payment method ($1,892.00 / plan price)
  ├─► Stripe emits invoice.paid webhook
  ├─► Local Invoice -> PAID
  ├─► Local Payment -> SUCCESS
  ├─► Subscription -> ACTIVE
  ├─► Period 1 created (Oct 1 - Jan 1)
  ├─► VisitAllocations provisioned (e.g. 12 visits)
  └─► Client can schedule visits
```

---

## 13. 15-Day Reminder Implementation

- **Rule**: Reminder is dispatched exactly 15 days before the upcoming billing date.
- **Oct 1 Billing**: Reminder date is **September 16**.
- **Nov 1 Billing**: Reminder date is **October 17**.
- **Deduplication**: Monitored via `BillingNotificationLog` table.

---

## 14. 10-Day Auto-Renewal Cancellation Implementation

- **Rule**: Clients can request auto-renewal cancellation up to 10 days before the upcoming renewal / month-end.
- **Nov 1 Renewal**: Cutoff date is **October 22**.
- **Oct 15 Request**: Allowed (before cutoff) -> sets `cancelAtPeriodEnd: true` in Stripe and local DB. Coverage remains active until period end.
- **Oct 25 Request**: Blocked for upcoming renewal -> Client informed of cutoff.
- **Zero 3-Day Cancellation**: No 3-day cancellation/refund workflow exists.

---

## 15. Unit Tests Performed & Results

```
==================================================
🧪 RUNNING COMPREHENSIVE BILLING LIFECYCLE TESTS
==================================================
✅ [PASS] TEST 1: Signup Sep 9, 2026 -> First billing Oct 1, 2026
✅ [PASS] TEST 2: Signup Sep 30, 2026 -> First billing Oct 1, 2026
✅ [PASS] TEST 3: Signup Oct 1, 2026 -> First billing Nov 1, 2026
✅ [PASS] TEST 4: Signup Jan 31 (Leap year) -> First billing Feb 1, 2028
✅ [PASS] TEST 5: Signup Dec 31, 2026 -> First billing Jan 1, 2027 (Year rollover)
✅ [PASS] TEST 6: Service commencement equals first billing date (Oct 1, 2026)
✅ [PASS] TEST 7: Attempt charge on Sep 30 for Oct 1 billing -> BLOCKED
✅ [PASS] TEST 8: Attempt charge on Oct 1 for Oct 1 billing -> ALLOWED
✅ [PASS] TEST 9: Stripe trial_end timestamp resolves strictly to Oct 1 in America/New_York
✅ [PASS] TEST 10: 15-day reminder for Oct 1 -> Sep 16
✅ [PASS] TEST 11: 15-day reminder for Nov 1 -> Oct 17
✅ [PASS] TEST 12: Cancellation cutoff for Nov 1 renewal -> Oct 22
✅ [PASS] TEST 13: Client cancels on Oct 15 for Nov 1 renewal -> Allowed
✅ [PASS] TEST 14: Client cancels on Oct 25 for Nov 1 renewal -> Rejected
✅ [PASS] TEST 15: Quarterly period end for Oct 1, 2026 -> Jan 1, 2027
==================================================
📊 TEST RESULTS: 15 / 15 PASSED (100% SUCCESS)
==================================================
```

---

## 16. Build & Typecheck Results

- **Backend Typecheck (`pnpm tsc --noEmit` in `age-well-ri-backend`)**: **0 errors (PASSED)**
- **Frontend Typecheck (`pnpm tsc --noEmit` in `age-well-ri`)**: **0 errors (PASSED)**

---

## 17. Final Acceptance Criteria Verification

- [x] **Signup never charges the client ($0 SetupIntent)**
- [x] **Payment method is saved securely off-session through Stripe**
- [x] **First billing date is ALWAYS the 1st of the following calendar month**
- [x] **First service date is ALWAYS the 1st of the following calendar month**
- [x] **September 30 CANNOT trigger an October 1 signup's first charge**
- [x] **No date calculation can accidentally turn the first billing date into the last day of the signup month**
- [x] **Backend prevents payment before firstBillingDate (`isChargeAllowed`)**
- [x] **Stripe configuration matches the required billing date (`trial_end` at 12:00:00 UTC)**
- [x] **There is only one authoritative charging mechanism (Stripe Subscription)**
- [x] **Local Payment is not marked PAID before real Stripe confirmation**
- [x] **Local Invoice is not marked PAID before real Stripe confirmation**
- [x] **Successful Stripe webhook activates the correct billing period**
- [x] **Visit entitlement is provisioned upon successful payment on the 1st**
- [x] **Client scheduling respects service commencement and entitlement rules**
- [x] **Renewal happens on the 1st of every month / quarter**
- [x] **Renewal reminder is sent 15 days before billing**
- [x] **Client auto-renewal cancellation follows the 10-day cutoff**
- [x] **No 3-day cancellation/refund workflow exists**
- [x] **Existing Admin cancellation remains unchanged**
- [x] **Dynamic plan pricing remains unchanged**
- [x] **Existing Agreement → Plan → Subscription relationship remains intact**
- [x] **Existing unrelated workflows are preserved**
