import {
  UserProfile,
  ServicePlan,
  Appointment,
  Report,
  Agreement,
  BillingInfo,
  NotificationItem,
  VisitType,
} from "../types/dashboard";
import {
  MOCK_USER,
  MOCK_PLAN,
  MOCK_APPOINTMENTS,
  MOCK_REPORTS,
  MOCK_AGREEMENT,
  MOCK_BILLING,
  MOCK_NOTIFICATIONS,
} from "./mock-data";

export async function getMemberProfile(): Promise<UserProfile> {
  await new Promise((res) => setTimeout(res, 150));
  return MOCK_USER;
}

export async function getCurrentPlan(): Promise<ServicePlan> {
  await new Promise((res) => setTimeout(res, 150));
  return MOCK_PLAN;
}

export async function getAppointments(): Promise<Appointment[]> {
  await new Promise((res) => setTimeout(res, 150));
  return MOCK_APPOINTMENTS;
}

export async function getAppointmentById(id: string): Promise<Appointment | undefined> {
  await new Promise((res) => setTimeout(res, 150));
  return MOCK_APPOINTMENTS.find((a) => a.id === id);
}

export async function getReports(): Promise<Report[]> {
  await new Promise((res) => setTimeout(res, 150));
  return MOCK_REPORTS;
}

export async function getAgreement(): Promise<Agreement> {
  await new Promise((res) => setTimeout(res, 150));
  return MOCK_AGREEMENT;
}

export async function getBillingDetails(): Promise<BillingInfo> {
  await new Promise((res) => setTimeout(res, 150));
  return MOCK_BILLING;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  await new Promise((res) => setTimeout(res, 150));
  return MOCK_NOTIFICATIONS;
}

export async function scheduleAppointment(data: {
  serviceType: VisitType;
  date: string;
  timeSlot: string;
  notes?: string;
}): Promise<Appointment> {
  await new Promise((res) => setTimeout(res, 400));
  const newAppt: Appointment = {
    id: `appt_${Date.now()}`,
    serviceType: data.serviceType,
    date: data.date,
    timeSlot: data.timeSlot,
    status: "scheduled",
    technicianName: data.serviceType === "Cleaning" ? "Elena Rostova" : "Marcus Vance",
    technicianTitle:
      data.serviceType === "Cleaning"
        ? "Senior Home Safety Speacialist"
        : "Certified Home Safety Specialist",
    bookedBy: "Client",
    notes: data.notes,
  };
  MOCK_APPOINTMENTS.unshift(newAppt);
  MOCK_PLAN.completedVisits = Math.min(MOCK_PLAN.completedVisits, MOCK_PLAN.totalVisits);
  return newAppt;
}
