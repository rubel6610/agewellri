export type FamilyInviteStatus = "NOT_INVITED" | "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export interface FamilyMemberItem {
  id: string;
  clientId: string;
  userId?: string | null;
  name: string;
  relationship: string;
  email: string;
  phone?: string | null;
  reportAccess: boolean;
  portalAccess: boolean;
  billingAccess: boolean;
  isEmergencyContact?: boolean;
  invitationStatus: FamilyInviteStatus;
  inviteStatus?: string;
  invitationExpiresAt?: string | null;
  invitedAt?: string | null;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FamilyMember = FamilyMemberItem;

export interface FamilyMembersResponseData {
  client: {
    id: string;
    clientNumber: string;
    clientName: string;
  };
  isPrimary: boolean;
  permissions: {
    reportAccess: boolean;
    portalAccess: boolean;
    billingAccess: boolean;
  };
  familyMembers: FamilyMemberItem[];
}

export interface CreateFamilyMemberRequest {
  name: string;
  relationship: string;
  email: string;
  phone?: string | null;
  password?: string | null;
  reportAccess?: boolean;
  portalAccess?: boolean;
  billingAccess?: boolean;
  isEmergencyContact?: boolean;
  sendInviteNow?: boolean;
  sendInvite?: boolean;
  sendCredentialsNow?: boolean;
}

export interface UpdateFamilyMemberRequest {
  name?: string;
  relationship?: string;
  email?: string;
  phone?: string | null;
  password?: string | null;
  reportAccess?: boolean;
  portalAccess?: boolean;
  billingAccess?: boolean;
  isEmergencyContact?: boolean;
  sendCredentialsNow?: boolean;
}

export interface VerifyFamilyInviteResponseData {
  valid: boolean;
  name?: string;
  email?: string;
  relationship?: string;
  phone?: string | null;
  clientName: string;
  permissions?: {
    reportAccess: boolean;
    portalAccess: boolean;
    billingAccess: boolean;
  };
  familyMember: {
    id: string;
    name: string;
    relationship: string;
    email: string;
    phone?: string | null;
    reportAccess: boolean;
    portalAccess: boolean;
    billingAccess: boolean;
  };
}

export interface AcceptFamilyInviteRequest {
  token: string;
  email?: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export interface SendReportToFamilyRequest {
  familyMemberIds: string[];
  additionalEmails?: string[];
  customMessage?: string | null;
  customNote?: string | null;
}
