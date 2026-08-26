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
  status: "scheduled" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no_show";
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
  technicianId?: string;
  technicianName?: string;
  reason?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: "SCHEDULED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
}
