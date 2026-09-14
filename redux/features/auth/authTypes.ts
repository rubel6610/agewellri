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

export type SignerRole =
  | "RESIDENT"
  | "FAMILY_MEMBER"
  | "CAREGIVER"
  | "POWER_OF_ATTORNEY"
  | "AUTHORIZED_REPRESENTATIVE";

export type HomeAccessType =
  | "LOCKBOX"
  | "RESIDENT_ANSWERS"
  | "DIGITAL_CODE"
  | "OTHER";

export interface ClientProfile {
  id: string;
  userId: string;
  clientNumber: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  dateOfBirth?: string;
  signerRole?: SignerRole;
  legalAuthority?: string | null;
  primaryContactName?: string | null;
  primaryContactPhone?: string | null;
  primaryContactEmail?: string | null;
  primaryContactRelation?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  homeAccessType?: HomeAccessType;
  homeAccessInstructions?: string | null;
  selectedPlan?: string | null;
  hasCleaningAddon?: boolean;
  hasCompletedAgreement?: boolean;
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
  permissions?: string[];
  isFamilyMember?: boolean;
  isPrimary?: boolean;
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
  refreshToken?: string;
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

export interface RequestSmsOtpRequest {
  phone: string;
}

export interface VerifySmsOtpRequest {
  phone: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
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
  homeAccessType?: HomeAccessType;
  homeAccessInstructions?: string | null;
}

export interface SubmitAgreementRequest {
  clientFullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  dob?: string | null;
  email?: string;
  signingTrack?: "TRACK_A" | "TRACK_B";
  signerRole?: SignerRole;
  representativeCapacity?:
    | "ATTORNEY_IN_FACT"
    | "GUARDIAN"
    | "CONSERVATOR"
    | null;
  authorityDocumentUrl?: string | null;
  signerName?: string | null;
  signerEmail?: string | null;
  signerPhone?: string | null;
  legalAuthority?: string | null;
  legalAuthorityOther?: string | null;
  primaryBillingContact?: string | null;
  primaryContactName?: string | null;
  primaryContactPhone?: string | null;
  primaryContactEmail?: string | null;
  primaryContactRelation?: string | null;
  authorizedRecipients?: Array<{
    name: string;
    relationship: string;
    email: string;
  }>;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;
  emergencyContactRelation?: string | null;
  homeAccessType?: HomeAccessType;
  homeAccessInstructions?: string | null;
  homeAccessCode?: string | null;
  homeAccessAuthorized?: boolean;
  authorizations?: {
    emergencyRightOfEntry?: boolean;
    residentAutonomyAcknowledgment?: boolean;
    automaticBillingAuthorization?: boolean;
  };
  planId?: string | null;
  planVersionId?: string | null;
  selectedPlan: string;
  hasCleaningAddon?: boolean;
  billingMethod?: "AUTOMATIC" | "INVOICE";
  paymentMethodId?: string | null;
  setupIntentId?: string | null;
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
  version?: string;
  state?: string;
  status: string;
  selectedPlan: string;
  planName?: string | null;
  planPrice: number;
  hasCleaningAddon: boolean;
  signerRole?: SignerRole;
  signerName?: string | null;
  signerEmail?: string | null;
  signerPhone?: string | null;
  signingTrack?: "TRACK_A" | "TRACK_B";
  representativeCapacity?:
    | "ATTORNEY_IN_FACT"
    | "GUARDIAN"
    | "CONSERVATOR"
    | string
    | null;
  repFullName?: string | null;
  legalAuthority?: string | null;
  legalAuthorityOther?: string | null;
  authorityDocumentUrl?: string | null;
  documentUrl?: string | null;
  primaryBillingContact?: string | null;
  cancellationDeadline?: string | null;
  cancellationDeadlineRule?: string | null;
  planSnapshot?: any;
  clientFullName: string;
  clientName?: string;
  clientPrintedName: string;
  authorizedRepName?: string | null;
  relationshipToClient?: string | null;
  clientSignature?: string | null;
  agreementDate: string;
  signedDate?: string | null;
  signedAt?: string | null;
  executedAt?: string | null;
  address: string;
  city: string;
  stateAddress?: string;
  postalCode: string;
  phone: string;
  dob?: string;
  dateOfBirth?: string | null;
  email: string;
  clientEmail?: string;
  primaryContactName?: string | null;
  primaryContactPhone?: string | null;
  primaryContactEmail?: string | null;
  primaryContactRelation?: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail?: string | null;
  emergencyContactRelation?: string | null;
  authorizedRecipients?: Array<{
    name: string;
    relationship: string;
    email: string;
    phone?: string | null;
  }>;
  homeAccessType?: HomeAccessType;
  homeAccessInstructions?: string | null;
  homeAccessCode?: string | null;
  homeAccessAuthorized?: boolean;
  authorizations?: {
    emergencyRightOfEntry?: boolean;
    residentAutonomyAcknowledgment?: boolean;
    automaticBillingAuthorization?: boolean;
  };
  clientNumber: string;
  clientId?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
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
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}
