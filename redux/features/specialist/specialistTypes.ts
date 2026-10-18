export interface SpecialistTimeWindow {
  start: string;
  end: string;
}

export interface SpecialistDaySchedule {
  dayOfWeek: number;
  dayName?: string;
  isOpen?: boolean;
  isAvailable?: boolean;
  timeWindows: SpecialistTimeWindow[];
}

export interface SpecialistItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  title: string;
  specialties: string[];
  shssCertified?: boolean;
  shssRenewalDate?: string | null;
  cprCertified?: boolean;
  cprExpiryDate?: string | null;
  aedCertified?: boolean;
  aedExpiryDate?: string | null;
  backgroundChecked?: boolean;
  bilingualSpanish?: boolean;
  color: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  notes?: string | null;
  displayOrder: number;
  weeklySchedule?: SpecialistDaySchedule[] | null;
  activeAssignmentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialistPayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  title?: string;
  specialties?: string[];
  shssCertified?: boolean;
  shssRenewalDate?: string | null;
  cprCertified?: boolean;
  cprExpiryDate?: string | null;
  aedCertified?: boolean;
  aedExpiryDate?: string | null;
  backgroundChecked?: boolean;
  bilingualSpanish?: boolean;
  color?: string;
  notes?: string | null;
  displayOrder?: number;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  weeklySchedule?: SpecialistDaySchedule[] | null;
}

export interface UpdateSpecialistPayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  title?: string;
  specialties?: string[];
  shssCertified?: boolean;
  shssRenewalDate?: string | null;
  cprCertified?: boolean;
  cprExpiryDate?: string | null;
  aedCertified?: boolean;
  aedExpiryDate?: string | null;
  backgroundChecked?: boolean;
  bilingualSpanish?: boolean;
  color?: string;
  notes?: string | null;
  displayOrder?: number;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  isArchived?: boolean;
  weeklySchedule?: SpecialistDaySchedule[] | null;
}

export interface AssignSpecialistPayload {
  appointmentId: string;
  specialistId: string;
}
