export interface ServicePlan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  billingInterval: "MONTHLY";
  totalVisits: number;
  times?: string | null;
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
  times?: string;
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
  times?: string;
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

export function formatPlanDuration(times?: string | number | null): string {
  if (!times) return "Up to 2 hours";
  const str = String(times).trim();
  if (str.toLowerCase().includes("an hour") || str.toLowerCase().includes("one hour")) {
    return "Up to an hour";
  }
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  if (!isNaN(num) && num > 0) {
    if (num === 1) return "Up to an hour";
    return `Up to ${num} hours`;
  }
  return str.startsWith("Up to") ? str : `Up to ${str}`;
}

export function parsePlanDurationHours(times?: string | number | null): number {
  if (times === undefined || times === null || times === "") return 2;
  const str = String(times).trim().toLowerCase();
  if (str.includes("an hour") || str.includes("one hour")) return 1;
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  return isNaN(num) || num <= 0 ? 2 : num;
}
