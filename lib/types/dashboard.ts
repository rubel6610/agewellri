export type AccountStatus =
  | "pending_agreement"
  | "pending_payment"
  | "active"
  | "suspended"
  | "cancelled";

export type ServicePlanType = string;

export interface ServicePlan {
  id?: string;
  name: ServicePlanType;
  status?: "active" | "pending" | "expired" | "cancelled" | string;
  currentPeriod: string;
  renewalDate: string;
  totalVisits: number;
  completedVisits: number;
  remainingVisits: number;
  cleaningVisitsTotal: number;
  cleaningVisitsCompleted: number;
  safetyVisitsTotal: number;
  safetyVisitsCompleted: number;
  autoRenew?: boolean;
  pricePerMonth?: string;
  pricePerQuarter?: string;
}

export type VisitType = "Safety Oversight" | "Cleaning";

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "rescheduled";

export interface Appointment {
  id: string;
  serviceType: VisitType;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  technicianName: string;
  technicianTitle: string;
  bookedBy: "Client" | "AgeWellRI Team";
  reportId?: string;
  reportTitle?: string;
  notes?: string;
}

export interface Report {
  id: string;
  title: string;
  visitDate: string;
  score?: number;
  status: "available" | "pending" | "no_report";
  pdfUrl?: string;
  summary: string;
  recommendationsCount: number;
}

export interface Agreement {
  id: string;
  title: string;
  status: "pending_signature" | "signed" | "executed";
  signedDate?: string;
  lastUpdated: string;
  pdfUrl: string;
  version: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  pdfUrl: string;
}

export interface BillingInfo {
  currentPlanName: ServicePlanType;
  billingFrequency: "Monthly" | "MONTHLY" | "Annual";
  paymentMethod: {
    brand: string;
    last4: string;
    expiry: string;
  };
  nextPaymentDate: string;
  nextPaymentAmount: string;
  autoPayEnabled: boolean;
  invoices: Invoice[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergencyContact: EmergencyContact;
  preferredContactMethod: "phone" | "email" | "sms";
  accountStatus: AccountStatus;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "visit" | "report" | "billing" | "agreement";
  link?: string;
}
