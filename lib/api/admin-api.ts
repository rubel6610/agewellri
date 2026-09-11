import {
  AdminStats,
  MasterClientRecord,
  AdminAppointment,
  AdminVisit,
  AdminReport,
  AdminAgreement,
  AdminInvoice,
  AdminSubscription,
  AdminNotification,
  AuditActivityLog,
} from "../types/admin";
import {
  MOCK_ADMIN_STATS,
  MOCK_ADMIN_CLIENTS,
  MOCK_ADMIN_APPOINTMENTS,
  MOCK_ADMIN_VISITS,
  MOCK_ADMIN_REPORTS,
  MOCK_ADMIN_AGREEMENTS,
  MOCK_ADMIN_INVOICES,
  MOCK_ADMIN_SUBSCRIPTIONS,
  MOCK_ADMIN_NOTIFICATIONS,
  MOCK_AUDIT_LOGS,
} from "./admin-mock-data";

export async function getAdminStats(): Promise<AdminStats> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_STATS;
}

export async function getAdminClients(): Promise<MasterClientRecord[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_CLIENTS;
}

export async function getClientDetailById(id: string): Promise<MasterClientRecord | undefined> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_CLIENTS.find((c) => c.id === id || c.id.toLowerCase() === id.toLowerCase());
}

export async function getAdminAppointments(): Promise<AdminAppointment[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_APPOINTMENTS;
}

export async function getAdminVisits(): Promise<AdminVisit[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_VISITS;
}

export async function getAdminReports(): Promise<AdminReport[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_REPORTS;
}

export async function getAdminAgreements(): Promise<AdminAgreement[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_AGREEMENTS;
}

export async function getAdminBilling(): Promise<AdminInvoice[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_INVOICES;
}

export async function getAdminSubscriptions(): Promise<AdminSubscription[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_SUBSCRIPTIONS;
}

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_ADMIN_NOTIFICATIONS;
}

export async function getClientAuditLogs(clientId: string): Promise<AuditActivityLog[]> {
  await new Promise((res) => setTimeout(res, 120));
  return MOCK_AUDIT_LOGS.filter((log) => log.clientId === clientId || clientId === "AW-1001");
}

export async function createClientAccount(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  planName: string;
}): Promise<MasterClientRecord> {
  await new Promise((res) => setTimeout(res, 350));
  const newClient: MasterClientRecord = {
    id: `AW-${1000 + MOCK_ADMIN_CLIENTS.length + 1}`,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    address: {
      street: data.street,
      city: data.city,
      state: data.state,
      zip: data.zip,
    },
    planName: data.planName,
    status: "agreement_pending",
    agreementStatus: "pending_signature",
    paymentStatus: "pending",
    renewalDate: "2026-09-01",
    totalVisitsAllowed: 4,
    completedVisitsCount: 0,
    remainingVisitsCount: 4,
    createdAt: new Date().toISOString().split("T")[0],
  };

  MOCK_ADMIN_CLIENTS.unshift(newClient);
  return newClient;
}

export async function adminBookAppointment(data: {
  clientId: string;
  serviceType: "Safety Oversight" | "Cleaning";
  date: string;
  timeSlot: string;
  technicianName: string;
  notes?: string;
}): Promise<AdminAppointment> {
  await new Promise((res) => setTimeout(res, 350));
  const client = MOCK_ADMIN_CLIENTS.find((c) => c.id === data.clientId) || MOCK_ADMIN_CLIENTS[0];

  const newAppt: AdminAppointment = {
    id: `appt_${Date.now()}`,
    clientId: client.id,
    clientName: `${client.firstName} ${client.lastName}`,
    clientPhone: client.phone,
    clientAddress: `${client.address.street}, ${client.address.city}`,
    serviceType: data.serviceType,
    date: data.date,
    timeSlot: data.timeSlot,
    status: "scheduled",
    technicianId: "tech_01",
    technicianName: data.technicianName,
    bookedBy: "AgeWellRI Admin",
    notes: data.notes,
  };

  MOCK_ADMIN_APPOINTMENTS.unshift(newAppt);
  return newAppt;
}

export async function uploadVisitReport(data: {
  visitId: string;
  clientId: string;
  score: number;
  summary: string;
  pdfFileName?: string;
}): Promise<AdminReport> {
  await new Promise((res) => setTimeout(res, 350));
  const client = MOCK_ADMIN_CLIENTS.find((c) => c.id === data.clientId) || MOCK_ADMIN_CLIENTS[0];

  const newReport: AdminReport = {
    id: `rep_${Date.now()}`,
    clientId: client.id,
    clientName: `${client.firstName} ${client.lastName}`,
    visitId: data.visitId,
    title: "Age Safe® Home Score™ Assessment",
    visitDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    score: data.score,
    status: "uploaded",
    pdfUrl: "#",
    uploadedAt: "Today",
    summary: data.summary,
  };

  MOCK_ADMIN_REPORTS.unshift(newReport);
  return newReport;
}
