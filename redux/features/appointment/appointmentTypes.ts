export interface AppointmentItem {
  id: string;
  clientId: string;
  clientNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  serviceTypeId?: string;
  serviceType: string;
  serviceCategory: string;
  durationMinutes: number;
  subscriptionPeriodId?: string | null;
  technicianId?: string | null;
  technicianName: string;
  technicianTitle: string;
  technicianPhone?: string | null;
  technicianColor?: string;
  startAt: string;
  endAt: string;
  date: string;
  timeSlot: string;
  status: "requested" | "scheduled" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no_show" | string;
  isRequested?: boolean;
  reportStatus?: "uploaded" | "not_uploaded";
  hasReport?: boolean;
  reportId?: string | null;
  reportTitle?: string | null;
  reportFileUrl?: string | null;
  reportUploadedAt?: string | null;
  visitId?: string | null;
  location: string;
  notes: string;
  bookedBy: string;
  createdAt: string;
}

export interface ScheduleAppointmentRequest {
  serviceTypeId?: string;
  serviceType?: string;
  technicianId?: string;
  technicianName?: string;
  date: string;
  timeSlot: string;
  notes?: string;
  location?: string;
}

export interface AdminScheduleAppointmentRequest {
  clientId: string;
  serviceTypeId?: string;
  serviceType?: string;
  technicianId?: string;
  technicianName?: string;
  date: string;
  timeSlot: string;
  notes?: string;
  location?: string;
}

export interface RescheduleAppointmentRequest {
  date: string;
  timeSlot: string;
  startAt?: string;
  endAt?: string;
  technicianId?: string;
  reason?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: "REQUESTED" | "SCHEDULED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
}

export interface AcceptVisitRequest {
  technicianId: string;
  technicianName?: string;
  date?: string;
  timeSlot?: string;
  startAt?: string;
  endAt?: string;
  notes?: string;
}

export interface DeclineVisitRequest {
  reason?: string;
}
