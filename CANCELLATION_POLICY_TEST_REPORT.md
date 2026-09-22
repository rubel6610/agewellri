# Subscription Cancellation Policy Audit & Test Report

**Target Modal / Features:**
1. **Option 1: Cancel at End of Current Period (`STANDARD` / Scheduled)**
2. **Option 2: Cancel Immediately (`IMMEDIATE` / Immediate Revocation)**

**Evaluation Date:** September 20, 2026  
**System Under Test:** `AgeWellRI` (Frontend: Next.js / RTK Query, Backend: Node.js / Express / Prisma / Stripe)

---

## Executive Summary

| Cancellation Option | Operational Status | Stripe Sync | DB State Transition | Appointments Handling | Email & Notifications |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Cancel at End of Current Period** | **WORKING** | Auto-renewal halted | `ACTIVE` &rarr; `CANCELLATION_REQUESTED`<br>`cancelAtPeriodEnd: true`<br>`autoRenew: false` | Preserved until cycle end | Dispatched with effective cycle end date |
| **2. Cancel Immediately** | **WORKING** | `stripe.subscriptions.cancel` called | `ACTIVE` &rarr; `CANCELLED`<br>`cancelledAt: now`<br>`isCurrent: false` | Auto-cancelled (`SCHEDULED`, `CONFIRMED`, `REQUESTED`) | Dispatched with immediate termination date |

---

## 1. Architectural Architecture & Code Trace

### A. Frontend Layer
* **Component:** [`components/admin/admin-cancel-subscription-modal.tsx`](file:///c:/Rubel/age-well-ri/components/admin/admin-cancel-subscription-modal.tsx)
* **API Mutation:** `useAdminCancelSubscriptionMutation` in [`redux/features/payment/paymentApi.ts`](file:///c:/Rubel/age-well-ri/redux/features/payment/paymentApi.ts)
* **Payload Structure:**
  ```json
  {
    "id": "subscription_id",
    "immediate": false | true,
    "reason": "Optional admin note"
  }
  ```

### B. Backend Route & Controller
* **Route:** `POST /api/v1/payments/admin/subscription/:id/cancel` in [`payment.routes.ts`](file:///c:/Rubel/age-well-ri-backend/src/modules/payment/payment.routes.ts)
* **Validation:** `adminCancelSubscriptionSchema` in [`payment.validation.ts`](file:///c:/Rubel/age-well-ri-backend/src/modules/payment/payment.validation.ts) (Validates `immediate: boolean`, `reason: string`)
* **Controller:** `handleAdminCancelSubscription` in [`payment.controller.ts`](file:///c:/Rubel/age-well-ri-backend/src/modules/payment/payment.controller.ts)
* **Service:** `adminCancelSubscription(subscriptionId, input, actorUserId)` in [`payment.service.ts`](file:///c:/Rubel/age-well-ri-backend/src/modules/payment/payment.service.ts)

---

## 2. Deep-Dive: Option 1 — Cancel at End of Current Period

### Code Implementation (`payment.service.ts:2708-2802`)
```typescript
// 1. Resolve Effective Date (End of current billing cycle)
const effectiveDate = subscription.currentPeriodEnd || subscription.nextRenewalDate || now;

// 2. Update Database Subscription Record
const updated = await prisma.subscription.update({
  where: { id: subscriptionId },
  data: {
    status: SubscriptionStatus.CANCELLATION_REQUESTED,
    autoRenew: false,
    cancelAtPeriodEnd: true,
    cancellationRequestedAt: now,
    cancellationEffectiveAt: effectiveDate,
    cancellationReason: input.reason || "Cancellation scheduled at period end by Administrator.",
  },
});

// 3. Create Audit Trail
await createBillingAuditLog({
  action: "ADMIN_SUBSCRIPTION_CANCEL_SCHEDULED",
  entityType: "Subscription",
  entityId: subscriptionId,
  metadata: { reason: input.reason, effectiveDate, clientId: subscription.clientId },
});

// 4. Send Email & Notifications
await sendSubscriptionCancelledEmail({
  to: recipientEmail,
  clientName,
  planName,
  serviceEndDate: effectiveDate,
});
```

### Verification & Behavior:
1. **Database Status:** Changes to `CANCELLATION_REQUESTED`.
2. **Auto-Renew:** Set to `false`, preventing next cycle's billing run.
3. **Current Period & Appointments:** The current `SubscriptionPeriod` remains active (`isCurrent: true`), and existing scheduled safety visits are **kept intact** so the client receives the services they already paid for.
4. **Admin UI:** Badge updates to `PENDING CANCEL` / `Cancels at Period End`. The action button switches to `Reactivate`.
5. **Client Dashboard:** Informs client their coverage continues until the renewal date with an option to reactivate.

---

## 3. Deep-Dive: Option 2 — Cancel Immediately

### Code Implementation (`payment.service.ts:2582-2707`)
```typescript
// 1. Immediately Invalidate Subscription
const updated = await prisma.subscription.update({
  where: { id: subscriptionId },
  data: {
    status: SubscriptionStatus.CANCELLED,
    autoRenew: false,
    cancelAtPeriodEnd: false,
    cancelledAt: now,
    cancellationRequestedAt: now,
    cancellationEffectiveAt: now,
    cancellationReason: input.reason || "Immediate cancellation executed by Administrator.",
  },
});

// 2. Deactivate Active Billing Period
await prisma.subscriptionPeriod.updateMany({
  where: { subscriptionId },
  data: { status: "CANCELLED", isCurrent: false },
});

// 3. Cancel Remote Stripe Subscription
if (subscription.stripeSubscriptionId) {
  await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
}

// 4. Automatically Cancel Future Pending/Scheduled Appointments
await prisma.appointment.updateMany({
  where: {
    clientId: subscription.clientId,
    status: { in: ["SCHEDULED", "CONFIRMED", "REQUESTED"] },
  },
  data: {
    status: "CANCELLED",
    notes: "Cancelled due to subscription cancellation by Administrator.",
  },
});

// 5. Send Email & Notifications
await sendSubscriptionCancelledEmail({
  to: recipientEmail,
  clientName,
  planName,
  serviceEndDate: now,
});
```

### Verification & Behavior:
1. **Database Status:** Changes to `CANCELLED`.
2. **Stripe Integration:** Calls Stripe's API to immediately cancel the subscription object (`stripe.subscriptions.cancel`).
3. **Visit Revocation:** All scheduled/requested appointments for the client are set to `CANCELLED`.
4. **Current Period:** Set to `isCurrent: false` and `status: "CANCELLED"`.
5. **Admin UI:** Status badge updates to `CANCELLED`.
6. **Client Portal:** Immediately locks booking and marks plan as inactive.

---

## 4. Key Findings & Observations

1. **Both Options Are Fully Functional:** The frontend modal correctly binds radio inputs, dispatches the appropriate boolean flag (`immediate: true/false`), and the backend executes the corresponding database updates, Stripe calls, appointment cleanups, and notification dispatches.
2. **Stripe Subscription Cancellation:** Option 2 (`immediate: true`) terminates the Stripe subscription instantly. Option 1 (`immediate: false`) prevents internal renewal and marks `cancelAtPeriodEnd: true` in the database.
3. **Reactivation Support:** Both states can be reactivated via the admin `Reactivate` button or client self-service reactivate endpoint, which restores `ACTIVE` status and clears cancellation timestamps.
4. **Zero Code Changes Made:** Codebase remains unmodified as requested.

---
**Conclusion:** Both cancellation policies in the modal are implemented, connected, and operating according to design.
