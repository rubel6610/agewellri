export interface PlanServiceAllocation {
  serviceTypeId: string;
  serviceName: string;
  category?: string;
  allocatedVisits: number;
  unit: string;
  durationMinutes?: number;
}

export interface ActivePlan {
  id: string;
  planId?: string;
  versionId?: string | null;
  versionNumber?: number;
  name: string;
  code: string;
  shortDescription?: string;
  fullDescription?: string;
  description?: string;
  price: number;
  currency?: string;
  billingInterval: "MONTHLY" | "MONTHLY" | "ANNUAL" | "ONE_TIME";
  supportsAutomaticBilling?: boolean;
  supportsInvoiceBilling?: boolean;
  autoRenewDefault?: boolean;
  features?: string[];
  services: PlanServiceAllocation[];
  totalVisits: number;
  effectiveFrom?: string;
  isActive?: boolean;
  subscribersCount?: number;
}

export interface AdminPlan {
  id: string;
  name: string;
  code: string;
  shortDescription?: string;
  fullDescription?: string;
  currentPrice: number;
  price?: number;
  currency: string;
  billingInterval: "MONTHLY" | "MONTHLY" | "ANNUAL" | "ONE_TIME";
  displayOrder: number;
  isActive: boolean;
  isArchived: boolean;
  supportsAutomaticBilling: boolean;
  supportsInvoiceBilling: boolean;
  autoRenewDefault?: boolean;
  activeSubscribersCount: number;
  totalVersionsCount: number;
  latestVersionNumber: number;
  latestVersionStatus: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  features: string[];
  services: PlanServiceAllocation[];
  totalVisits: number;
  versions?: PlanVersionDetail[];
  effectiveFrom: string;
  lastUpdated: string;
}

export interface PlanVersionDetail {
  id: string;
  versionNumber: number;
  name: string;
  description?: string;
  status: string;
  price: number;
  currency: string;
  billingInterval: string;
  features: string[];
  effectiveFrom: string;
  effectiveTo?: string;
  planServices: {
    serviceTypeId: string;
    allocatedVisits: number;
    unit: string;
    serviceType: {
      id: string;
      name: string;
      category: string;
    };
  }[];
}

export interface AdminPlanDetail {
  id: string;
  name: string;
  code: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  currentPrice?: number;
  billingInterval: string;
  displayOrder: number;
  isActive: boolean;
  isArchived: boolean;
  supportsAutomaticBilling: boolean;
  supportsInvoiceBilling: boolean;
  autoRenewDefault: boolean;
  activeSubscribersCount?: number;
  totalVisits?: number;
  features?: string[];
  services?: PlanServiceAllocation[];
  stripeProductId?: string;
  versions: PlanVersionDetail[];
  subscriptions: {
    id: string;
    status: string;
    contractedPrice?: number;
    billingInterval?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    planVersionId?: string;
    client: {
      id: string;
      clientNumber: string;
      user?: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
      };
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
  }[];
}

export interface ServiceItem {
  id: string;
  name: string;
  code?: string;
  category:
    | "CLEANING"
    | "SAFETY_OVERSIGHT"
    | "ASSESSMENT"
    | "WELLNESS"
    | "OTHER";
  description?: string;
  durationMinutes: number;
  defaultPrice?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlanPayload {
  name: string;
  code: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  currency?: string;
  billingInterval: "MONTHLY" | "MONTHLY" | "ANNUAL" | "ONE_TIME";
  displayOrder?: number;
  supportsAutomaticBilling?: boolean;
  supportsInvoiceBilling?: boolean;
  autoRenewDefault?: boolean;
  features: string[];
  services: {
    serviceTypeId: string;
    allocatedVisits: number;
    unit?: string;
    durationMinutes?: number;
  }[];
  isActive?: boolean;
  effectiveDate?: string;
}

export interface UpdatePlanPayload {
  name?: string;
  shortDescription?: string;
  fullDescription?: string;
  price?: number;
  currency?: string;
  billingInterval?: "MONTHLY" | "MONTHLY" | "ANNUAL" | "ONE_TIME";
  displayOrder?: number;
  supportsAutomaticBilling?: boolean;
  supportsInvoiceBilling?: boolean;
  autoRenewDefault?: boolean;
  features?: string[];
  services?: {
    serviceTypeId: string;
    allocatedVisits: number;
    unit?: string;
    durationMinutes?: number;
  }[];
  isActive?: boolean;
  effectiveDate?: string;
  forceNewVersion?: boolean;
}

export interface ChangePlanStatusPayload {
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED" | "UNARCHIVED";
}

export interface CreateServicePayload {
  name: string;
  code?: string;
  category:
    | "CLEANING"
    | "SAFETY_OVERSIGHT"
    | "ASSESSMENT"
    | "WELLNESS"
    | "OTHER";
  description?: string;
  durationMinutes?: number;
  defaultPrice?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateServicePayload {
  name?: string;
  code?: string;
  category?:
    | "CLEANING"
    | "SAFETY_OVERSIGHT"
    | "ASSESSMENT"
    | "WELLNESS"
    | "OTHER";
  description?: string;
  durationMinutes?: number;
  defaultPrice?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface ServiceCatalogStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  totalCategories: number;
  activeCategoriesCount: number;
  categoryBreakdown: Record<string, { total: number; active: number }>;
  totalPlanAllocations: number;
  totalScheduledAppointments: number;
}
