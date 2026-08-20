export type ClientStatus =
  | "invited"
  | "account_created"
  | "agreement_pending"
  | "payment_pending"
  | "active"
  | "payment_failed"
  | "paused"
  | "cancelled"
  | "expired";

export type AdminRole = "owner" | "admin" | "staff";

export interface MasterClientRecord {
  id: string; // e.g. AW-1001
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
  planName: "Guardian Plus" | "Essential Guard" | "Cleaning Add-On" | "Standalone Cleaning";
  status: ClientStatus;
  agreementStatus: "pending_signature" | "signed" | "executed";
  agreementSignedDate?: string;
  paymentStatus: "paid" | "pending" | "failed";
  nextVisitDate?: string;
  renewalDate: string;
  totalVisitsAllowed: number;
  completedVisitsCount: number;
  remainingVisitsCount: number;
  createdAt: string;
  notes?: string;
}

export interface AdminAppointment {
  id: string; // appt_xxx
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  serviceType: "Safety Oversight" | "Cleaning";
  date: string;
  timeSlot: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "missed";
  technicianId: string;
  technicianName: string;
  bookedBy: "Client" | "AgeWellRI Admin" | "System Auto-renew";
  reportId?: string;
  reportStatus?: "pending" | "uploaded" | "emailed";
  notes?: string;
}

export interface AdminVisit {
  id: string;
  appointmentId: string;
  clientId: string;
  clientName: string;
  serviceType: "Safety Oversight" | "Cleaning";
  date: string;
  technicianName: string;
  status: "scheduled" | "in_progress" | "completed" | "missed" | "cancelled";
  reportStatus: "pending" | "uploaded" | "emailed";
  reportScore?: number;
}

export interface AdminReport {
  id: string;
  clientId: string;
  clientName: string;
  visitId: string;
  title: string;
  visitDate: string;
  score?: number;
  status: "pending" | "uploaded" | "emailed";
  pdfUrl?: string;
  uploadedAt?: string;
  summary?: string;
}

export interface AdminAgreement {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  status: "pending_signature" | "signed" | "executed";
  signedDate?: string;
  lastReminderSent?: string;
  version: string;
  pdfUrl: string;
}

export interface AdminInvoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  amount: string;
  planName: string;
  billingFrequency: "Quarterly" | "Monthly" | "Annual";
  status: "paid" | "pending" | "failed" | "refunded";
  date: string;
  dueDate: string;
  paymentMethod: string;
}

export interface AdminSubscription {
  id: string;
  clientId: string;
  clientName: string;
  planName: string;
  billingFrequency: "Quarterly" | "Monthly";
  currentPeriod: string;
  renewalDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  status: "active" | "renewing_soon" | "payment_failed" | "cancelled" | "expired";
  billingStatus: "ready" | "paid" | "failed";
  visitSchedulingStatus: "scheduled" | "partially_scheduled" | "not_scheduled";
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "onboarding" | "agreement" | "payment" | "visit" | "report" | "renewal";
  link?: string;
  severity: "info" | "warning" | "urgent";
}

export interface AuditActivityLog {
  id: string;
  clientId: string;
  timestamp: string;
  action: string;
  performedBy: string; // e.g. "Admin (Sarah Jenkins)" or "Client (John Smith)"
  details?: string;
}

export interface AdminStats {
  activeClientsCount: number;
  activeClientsDelta: string;
  pendingOnboardingCount: number;
  upcomingVisitsCount: number;
  reportsPendingCount: number;
  paymentsDueCount: number;
  renewalsUpcomingCount: number;
  attentionItemsCount: number;
}
