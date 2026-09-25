export interface ServicePlan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency?: string;
  billingInterval: "MONTHLY";
  totalVisits: number;
  times?: string | null;
  description?: string;
  shortDescription?: string;
  fullDescription?: string;
  features?: string[];
  displayOrder?: number;
  isActive?: boolean;
  isArchived?: boolean;
  supportsAutomaticBilling?: boolean;
  supportsInvoiceBilling?: boolean;
  autoRenewDefault?: boolean;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
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
  fullDescription?: string;
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
  fullDescription?: string;
  features?: string[];
  displayOrder?: number;
  supportsAutomaticBilling?: boolean;
  supportsInvoiceBilling?: boolean;
  autoRenewDefault?: boolean;
  isActive?: boolean;
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

/**
 * Format plan duration / times for display and persistence.
 * Examples:
 *   1 or "1" or "1 hour" or "an hour" or "Up to an hour" -> "Up to an hour"
 *   2 or "2" or "2 hours" or "Up to 2 hours" -> "Up to 2 hours"
 *   3 or "3" or "3 hours" or "Up to 3 hours" -> "Up to 3 hours"
 *   null / undefined / "" -> "Up to 2 hours" (default)
 */
export function formatPlanDuration(times?: string | number | null): string {
  if (times === undefined || times === null || times === "") {
    return "Up to 1 hour";
  }

  const str = String(times).trim();

  // If already formatted as "Up to 1 hour" or "Up to an hour"
  if (/^up\s+to\s+(an?|1)\s+hours?$/i.test(str)) {
    return "Up to 1 hour";
  }

  // If already formatted like "Up to X hours"
  const upToMatch = str.match(/^up\s+to\s+(\d+(?:\.\d+)?)\s*hours?$/i);
  if (upToMatch) {
    const hours = parseFloat(upToMatch[1]);
    if (hours === 1) return "Up to 1 hour";
    return `Up to ${hours} hours`;
  }

  // Check for phrases like "an hour", "one hour", "1 hour", "1 hr", "1"
  if (/^(an|one|1)\s*hours?$/i.test(str) || str.toLowerCase() === "an hour" || str.toLowerCase() === "one hour" || str.toLowerCase() === "1 hour") {
    return "Up to 1 hour";
  }

  // Extract first number if present
  const numMatch = str.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const hours = parseFloat(numMatch[1]);
    if (hours === 1) return "Up to 1 hour";
    if (hours > 0) return `Up to ${hours} hours`;
  }

  // Fallback
  if (str.toLowerCase().startsWith("up to")) {
    return str;
  }
  return `Up to ${str}`;
}

/**
 * Parse numeric hours from duration string/number.
 * Returns numeric hours (e.g. 1, 2, 3). Default is 2.
 */
export function parsePlanDurationHours(times?: string | number | null): number {
  if (times === undefined || times === null || times === "") return 2;
  if (typeof times === "number") return isNaN(times) || times <= 0 ? 2 : times;

  const str = String(times).trim().toLowerCase();
  if (str.includes("an hour") || str.includes("one hour")) return 1;

  const match = str.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    return isNaN(num) || num <= 0 ? 2 : num;
  }
  return 2;
}
