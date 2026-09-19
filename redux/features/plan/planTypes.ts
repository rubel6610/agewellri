export interface ServicePlan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  billingInterval: "MONTHLY";
  totalVisits: number;
  description?: string;
  shortDescription?: string;
  fullDescription?: string;
  features: string[];
  isActive: boolean;
  isArchived: boolean;
  displayOrder: number;
  supportsAutomaticBilling?: boolean;
  supportsInvoiceBilling?: boolean;
  autoRenewDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivePlan extends ServicePlan {
  subscribersCount?: number;
}

export interface AdminPlan extends ServicePlan {
  activeSubscribersCount: number;
  lastUpdated?: string;
}

export interface AdminPlanDetail extends ServicePlan {
  activeSubscribersCount?: number;
  subscriptions?: {
    id: string;
    status: string;
    billingInterval?: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    client: {
      id: string;
      clientNumber: string;
      user?: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
      };
      primaryContactName?: string;
      primaryContactEmail?: string;
      primaryContactPhone?: string;
    };
  }[];
}

export interface CreatePlanPayload {
  name: string;
  code?: string;
  price: number;
  currency?: string;
  billingInterval?: "MONTHLY";
  totalVisits: number;
  description?: string;
  shortDescription?: string;
  features: string[];
  displayOrder?: number;
  supportsAutomaticBilling?: boolean;
  supportsInvoiceBilling?: boolean;
  autoRenewDefault?: boolean;
  isActive?: boolean;
}

export interface UpdatePlanPayload {
  name?: string;
  code?: string;
  price?: number;
  currency?: string;
  billingInterval?: "MONTHLY";
  totalVisits?: number;
  description?: string;
  shortDescription?: string;
  features?: string[];
  displayOrder?: number;
  supportsAutomaticBilling?: boolean;
  supportsInvoiceBilling?: boolean;
  autoRenewDefault?: boolean;
  isActive?: boolean;
}

export interface ChangePlanStatusPayload {
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED" | "UNARCHIVED";
}
