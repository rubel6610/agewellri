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
  plan?: "ESSENTIAL_GUARD" | "GUARDIAN_PLUS";
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
  status: "paid" | "pending" | "failed";
  pdfUrl: string;
}

export interface BillingOverviewData {
  currentPlanName: "Essential Guard" | "Guardian Plus" | string;
  billingFrequency: "Quarterly" | "Monthly" | "Annual";
  paymentMethod: {
    brand: string;
    last4: string;
    expiry: string;
  };
  nextPaymentDate: string;
  nextPaymentAmount: string;
  autoPayEnabled: boolean;
  invoices: InvoiceItem[];
}

export interface ProcessAgreementPaymentRequest {
  agreementId?: string;
  paymentMethodId?: string;
  setupIntentId?: string;
  selectedPlan: "ESSENTIAL_GUARD" | "GUARDIAN_PLUS";
  hasCleaningAddon: boolean;
}

export interface ProcessAgreementPaymentData {
  success: boolean;
  message: string;
  client: any;
  subscription: any;
  invoice: any;
  payment: any;
}
