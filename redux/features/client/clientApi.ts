import { baseApi } from "../../api/baseApi";
import { ApiResponse } from "../auth/authTypes";

export interface MasterClientRecord {
  id: string;
  internalId: string;
  userId: string;
  clientNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  dateOfBirth?: string;
  state: string;
  signerRole: string;
  legalAuthority?: string;
  legalAuthorityOther?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  emergencyContactRelation?: string;
  homeAccessType?: string;
  homeAccessInstructions?: string;
  homeAccessCode?: string;
  planName: string;
  planCode: string;
  hasCleaningAddon: boolean;
  onboardingStatus: string;
  onboardingStep: number;
  agreementStatus: string;
  agreementSignedDate?: string | null;
  agreementDeadline?: string | null;
  paymentStatus: string;
  subscriptionStatus: string;
  cardBrand?: string;
  cardLast4?: string;
  totalVisitsAllowed: number;
  completedVisitsCount: number;
  remainingVisitsCount: number;
  nextVisitDate?: string | null;
  renewalDate?: string | null;
  status: "active" | "pending_onboarding" | "paused" | "cancelled";
  createdAt: string;
  timeline: {
    welcomeSent: boolean;
    accountCreated: boolean;
    signerSelected: boolean;
    emergencyContactAdded: boolean;
    stateSelected: boolean;
    agreementSent: boolean;
    agreementSigned: boolean;
    paymentProcessed: boolean;
    subscriptionActive: boolean;
  };
  agreements?: any[];
  latestAgreement?: any;
  subscriptions?: any[];
  invoices?: any[];
  appointments?: any[];
  reports?: any[];
  auditLogs?: Array<{
    id: string;
    action: string;
    details: string;
    performedBy: string;
    timestamp: string;
  }>;
}

export interface AdminAgreementRecord {
  id: string;
  clientId: string;
  clientNumber: string;
  clientName: string;
  clientEmail: string;
  title: string;
  state: string;
  version: string;
  signerRole: string;
  signerName: string;
  legalAuthority?: string;
  status: string;
  cancellationDeadline?: string;
  cancellationDeadlineRule?: string;
  planName: string;
  planPrice: number;
  signedDate?: string | null;
  executedAt?: string | null;
  hasCleaningAddon: boolean;
  clientSignature?: string;
}

export interface SendInvitationPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  state?: string;
  planName?: string;
  expiresInDays?: number;
  skipEmail?: boolean;
}

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminClients: builder.query<ApiResponse<MasterClientRecord[]>, { state?: string; onboardingStatus?: string; search?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.state) queryParams.append("state", params.state);
        if (params && params.onboardingStatus) queryParams.append("onboardingStatus", params.onboardingStatus);
        if (params && params.search) queryParams.append("search", params.search);
        const qs = queryParams.toString();
        return `/clients/admin/all${qs ? `?${qs}` : ""}`;
      },
      keepUnusedDataFor: 300,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Client" as const, id })),
              { type: "Client", id: "ADMIN_LIST" },
            ]
          : [{ type: "Client", id: "ADMIN_LIST" }],
    }),

    getAdminClientById: builder.query<ApiResponse<MasterClientRecord>, string>({
      query: (id) => `/clients/admin/${id}`,
      keepUnusedDataFor: 300,
      providesTags: (_result, _error, id) => [
        { type: "Client", id },
        { type: "Agreement", id },
      ],
    }),

    sendInvitation: builder.mutation<ApiResponse<{ invitation: any; invitationLink: string }>, SendInvitationPayload>({
      query: (body) => ({
        url: "/invitations/send",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Client", id: "ADMIN_LIST" }],
    }),

    getAdminAgreements: builder.query<ApiResponse<AdminAgreementRecord[]>, { state?: string; status?: string; search?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.state) queryParams.append("state", params.state);
        if (params && params.status) queryParams.append("status", params.status);
        if (params && params.search) queryParams.append("search", params.search);
        const qs = queryParams.toString();
        return `/agreements/admin/all${qs ? `?${qs}` : ""}`;
      },
      keepUnusedDataFor: 300,
      providesTags: ["Agreement"],
    }),

    sendAgreementReminder: builder.mutation<ApiResponse<{ success: boolean; message: string }>, string>({
      query: (agreementId) => ({
        url: `/agreements/admin/${agreementId}/reminder`,
        method: "POST",
      }),
      invalidatesTags: ["Agreement"],
    }),
  }),
});

export const {
  useGetAdminClientsQuery,
  useGetAdminClientByIdQuery,
  useSendInvitationMutation,
  useGetAdminAgreementsQuery,
  useSendAgreementReminderMutation,
} = clientApi;
