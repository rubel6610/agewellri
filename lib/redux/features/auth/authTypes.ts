export type UserRole = "CLIENT" | "ADMIN" | "TECHNICIAN";

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type OnboardingStatus =
  | "INVITED"
  | "ACCOUNT_CREATED"
  | "AGREEMENT_PENDING"
  | "AGREEMENT_SIGNED"
  | "PAYMENT_PENDING"
  | "PAYMENT_COMPLETED"
  | "ACTIVE";

export interface ClientProfile {
  id: string;
  userId: string;
  clientNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  onboardingStatus?: OnboardingStatus;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  employeeId?: string;
  title?: string;
  skills?: string[];
  serviceArea?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  client?: ClientProfile | null;
  technician?: TechnicianProfile | null;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | string | null;
}

export interface AuthResponseData {
  token: string;
  user: AuthUser;
  client?: ClientProfile | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}
