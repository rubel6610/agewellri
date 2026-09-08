export interface SpecialistItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  title: string;
  specialties: string[];
  color: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  notes?: string | null;
  displayOrder: number;
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
  color?: string;
  notes?: string | null;
  displayOrder?: number;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
}

export interface UpdateSpecialistPayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  title?: string;
  specialties?: string[];
  color?: string;
  notes?: string | null;
  displayOrder?: number;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
  isArchived?: boolean;
}

export interface AssignSpecialistPayload {
  appointmentId: string;
  specialistId: string;
}
