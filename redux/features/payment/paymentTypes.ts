export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | null;
}

export interface StripeConfigData {
  publishableKey: string;
}

export interface CreateSetupIntentRequest {
  plan?: string;
  hasCleaningAddon?: boolean;
}

export interface SetupIntentData {
  clientSecret: string;
  setupIntentId: string;
  customerId: string;
  publishableKey: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  description?: string;
  selectedPlan?: "ESSENTIAL_GUARD" | "GUARDIAN_PLUS";
  hasCleaningAddon?: boolean;
}

export interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  publishableKey: string;
}

export interface SavePaymentMethodRequest {
  paymentMethodId: string;
  setAsDefault?: boolean;
}

export interface CardDetails {
  brand: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
}

export interface PaymentMethodItem {
  id: string;
  brand: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export interface PaymentMethodsData {
  paymentMethods: PaymentMethodItem[];
  defaultPaymentMethodId?: string | null;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: string;
  status: "paid" | "open" | "overdue" | "draft" | "void" | string;
  pdfUrl: string;
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: string;
  status: string;
  receiptUrl: string;
  paymentMethod: string;
}

export interface VisitEntitlementItem {
  id: string;
  serviceTypeId: string;
  serviceName: string;
  serviceCode: string | null;
  category: string;
  durationMinutes: number;
  allocated: number;
  scheduled: number;
  completed: number;
  remaining: number;
  unit: string;
  status: "ACTIVE" | "EXHAUSTED" | "EXPIRED" | "CANCELLED";
}

export interface ClientVisitEntitlementsResponse {
  subscriptionId: string | null;
  planName: string;
  planCode: string;
  billingInterval: string;
  billingPeriod: {
    id: string;
    periodNumber: number;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    status: string;
  } | null;
  totalAllocated: number;
  totalScheduled: number;
  totalCompleted: number;
  totalRemaining: number;
  unscheduledCount?: number;
  isNewQuarterReadyToSchedule?: boolean;
  entitlements: VisitEntitlementItem[];
}

export interface BillingOverviewData {
  currentPlanName: string;
  selectedPlanCode: string;
  hasCleaningAddon: boolean;
  billingFrequency: string;
  billingMethod: "AUTOMATIC" | "INVOICE";
  subscriptionStatus: string;
  autoPayEnabled: boolean;
  cancelAtPeriodEnd: boolean;
  cancellationEffectiveAt?: string | null;
  currentPeriod: string;
  nextPaymentDate: string;
  nextPaymentAmount: string;
  paymentMethod: {
    brand: string;
    last4: string;
    expiry: string;
  };
  invoices: InvoiceItem[];
  payments: PaymentHistoryItem[];
  visitEntitlements?: VisitEntitlementItem[];
}

export interface ProcessAgreementPaymentRequest {
  agreementId?: string;
  paymentMethodId?: string;
  setupIntentId?: string;
  billingMethod?: "AUTOMATIC" | "INVOICE";
  selectedPlan?: string;
  plan?: string;
  hasCleaningAddon?: boolean;
}

export interface ProcessAgreementPaymentData {
  success: boolean;
  message: string;
  subscriptionId?: string;
  invoiceNumber?: string;
  invoiceId?: string;
  totalPrice?: number;
  billingMethod?: string;
  status?: string;
}

export interface CreateInvoicePaymentRequest {
  selectedPlan: "ESSENTIAL_GUARD" | "GUARDIAN_PLUS" | "STANDALONE_CLEANING";
  hasCleaningAddon: boolean;
}

export interface CancelRenewalRequest {
  reason?: string;
}

export interface CancelRenewalData {
  success: boolean;
  message: string;
  cancellationEffectiveAt: string;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
}

export interface ReactivateRenewalData {
  success: boolean;
  message: string;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
}

export interface AdminOverviewData {
  activeSubscriptions: number;
  paidThisMonth: string;
  pendingCharges: string;
  failedCharges: string;
  failedPaymentsCount: number;
  upcomingRenewalsNext30Days: number;
  recentTransactions: Array<{
    id: string;
    clientName: string;
    clientId: string;
    planName: string;
    amount: string;
    status: string;
    date: string;
  }>;
}

export interface AdminInvoiceItem {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientNumber: string;
  planName: string;
  billingFrequency: string;
  amount: string;
  paymentMethod: string;
  status: string;
  dueDate: string;
  paidAt?: string | null;
  pdfUrl: string;
}

export interface AdminInvoicesResponse {
  invoices: AdminInvoiceItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminSubscriptionItem {
  id: string;
  clientId: string;
  clientName: string;
  clientNumber: string;
  planName: string;
  planPrice: string;
  status: string;
  billingMethod: string;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  cancellationEffectiveAt?: string | null;
  currentPeriod: string;
  nextRenewalDate: string;
}

export interface AdminSubscriptionsResponse {
  subscriptions: AdminSubscriptionItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminRetryChargeRequest {
  invoiceId?: string;
  paymentId?: string;
}

export interface AdminRetryChargeData {
  success: boolean;
  message: string;
}

export interface AdminUpcomingRenewalItem {
  subscriptionId: string;
  clientId: string;
  clientNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  representativeEmail?: string | null;
  planName: string;
  contractedPrice: number;
  billingInterval: string;
  billingMethod: string;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  scheduledRenewalDate: string;
  daysRemaining: number;
  cardBrand: string;
  cardLast4: string;
}

export interface AdminUpcomingRenewalsResponse {
  renewals: AdminUpcomingRenewalItem[];
}

export interface AdminTriggerRemindersResponse {
  success: boolean;
  remindersSent: number;
  duplicateSkipped: number;
  checkedAt: string;
}

