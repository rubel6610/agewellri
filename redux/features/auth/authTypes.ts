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
  hasCompletedAgreement?: boolean;
  requiresAgreement?: boolean;
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

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
}

export interface SubmitAgreementRequest {
  clientFullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  dob: string;
  email?: string;
  primaryContactName?: string | null;
  primaryContactPhone?: string | null;
  primaryContactEmail?: string | null;
  primaryContactRelation?: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation?: string | null;
  selectedPlan: "ESSENTIAL_GUARD" | "GUARDIAN_PLUS";
  hasCleaningAddon: boolean;
  clientPrintedName: string;
  authorizedRepName?: string | null;
  relationshipToClient?: string | null;
  agreementDate: string;
  clientSignature: string;
  agreedToTerms: boolean;
}

export interface AgreementDocument {
  id: string;
  templateVersion: string;
  status: string;
  selectedPlan: "ESSENTIAL_GUARD" | "GUARDIAN_PLUS";
  planPrice: number;
  hasCleaningAddon: boolean;
  clientFullName: string;
  clientPrintedName: string;
  authorizedRepName?: string | null;
  relationshipToClient?: string | null;
  clientSignature?: string | null;
  agreementDate: string;
  signedAt?: string | null;
  executedAt?: string | null;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  dob?: string;
  email: string;
  primaryContactName?: string | null;
  primaryContactPhone?: string | null;
  primaryContactEmail?: string | null;
  primaryContactRelation?: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation?: string | null;
  clientNumber: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
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


