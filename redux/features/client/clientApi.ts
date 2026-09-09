import { baseApi } from "../../api/baseApi";
import { ApiResponse } from "../auth/authTypes";
import { VisitEntitlementItem } from "../payment/paymentTypes";

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
  totalVisitsCount?: number;
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
  visitEntitlements?: VisitEntitlementItem[];
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
  primaryContactName?: string;
  primaryContactPhone?: string | null;
  primaryContactEmail?: string;
  primaryContactRelation?: string;
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

export interface ClientAccessMethod {
  id: string;
  type: "LOCKBOX" | "RESIDENT_ANSWERS" | "DIGITAL_CODE" | "OTHER";
  title: string;
  code?: string | null;
  instructions?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAccessMethodPayload {
  type: "LOCKBOX" | "RESIDENT_ANSWERS" | "DIGITAL_CODE" | "OTHER";
  title: string;
  code?: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface UpdateAccessMethodPayload {
  type?: "LOCKBOX" | "RESIDENT_ANSWERS" | "DIGITAL_CODE" | "OTHER";
  title?: string;
  code?: string | null;
  instructions?: string | null;
  isDefault?: boolean;
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

export interface AdminDashboardStats {
  kpis: {
    activeClientsCount: number;
    totalClientsCount: number;
    newClientsThisMonth: number;
    pendingOnboardingCount: number;
    upcomingVisitsCount: number;
    completedVisitsCount: number;
    reportsPendingCount: number;
    totalReportsUploaded: number;
    executedAgreementsCount: number;
    pendingAgreementsCount: number;
    paymentsDueCount: number;
    totalPendingInvoicesAmount: string;
    totalRevenueCollected: string;
    renewalsUpcomingCount: number;
    activeSubscriptionsCount: number;
  };
  upcomingSchedule: Array<{
    id: string;
    clientName: string;
    clientId: string;
    serviceType: string;
    specialistName: string;
    specialistColor: string;
    dateFormatted: string;
    timeSlot: string;
    status: string;
    address: string;
  }>;
  recentClients: Array<{
    id: string;
    internalId: string;
    name: string;
    email: string;
    state: string;
    planName: string;
    status: string;
    createdAt: string;
  }>;
  attentionItems: Array<{
    id: string;
    type: "AGREEMENT" | "REPORT" | "BILLING" | "ONBOARDING";
    title: string;
    description: string;
    actionLabel: string;
    actionHref: string;
    urgency: "HIGH" | "MEDIUM" | "LOW";
  }>;
  planDistribution: Record<string, number>;
  stateDistribution: Record<string, number>;
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    performedBy: string;
    role: string;
    time: string;
    date: string;
  }>;
}

export const clientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardStats: builder.query<ApiResponse<AdminDashboardStats>, void>({
      query: () => "/clients/admin/dashboard-stats",
      providesTags: ["Client", "Appointment", "Report", "Agreement", "Billing", "Subscription"],
    }),

    getAdminClients: builder.query<
      ApiResponse<MasterClientRecord[]>,
      { state?: string; onboardingStatus?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.state) queryParams.append("state", params.state);
        if (params && params.onboardingStatus) queryParams.append("onboardingStatus", params.onboardingStatus);
        if (params && params.search) queryParams.append("search", params.search);
        if (params && params.page) queryParams.append("page", params.page.toString());
        if (params && params.limit) queryParams.append("limit", params.limit.toString());
        const qs = queryParams.toString();
        return `/clients/admin/all${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Client"],
    }),

    getAdminClientById: builder.query<ApiResponse<MasterClientRecord>, string>({
      query: (id) => `/clients/admin/${id}`,
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
      invalidatesTags: [{ type: "Client", id: "ADMIN_LIST" }, "Client"],
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
      providesTags: ["Agreement"],
    }),

    sendAgreementReminder: builder.mutation<ApiResponse<{ success: boolean; message: string }>, string>({
      query: (agreementId) => ({
        url: `/agreements/admin/${agreementId}/reminder`,
        method: "POST",
      }),
      invalidatesTags: ["Agreement"],
    }),

    deleteAdminAgreement: builder.mutation<ApiResponse<{ success: boolean; message: string }>, string>({
      query: (agreementId) => ({
        url: `/agreements/admin/${agreementId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Agreement", "Client"],
    }),

    getClientAccessMethods: builder.query<ApiResponse<ClientAccessMethod[]>, void>({
      query: () => "/clients/access-methods",
      providesTags: ["Client"],
    }),

    addClientAccessMethod: builder.mutation<ApiResponse<ClientAccessMethod>, CreateAccessMethodPayload>({
      query: (body) => ({
        url: "/clients/access-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Client"],
    }),

    updateClientAccessMethod: builder.mutation<
      ApiResponse<ClientAccessMethod>,
      { id: string; body: UpdateAccessMethodPayload }
    >({
      query: ({ id, body }) => ({
        url: `/clients/access-methods/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Client"],
    }),

    deleteClientAccessMethod: builder.mutation<ApiResponse<{ success: boolean; message: string }>, string>({
      query: (id) => ({
        url: `/clients/access-methods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Client"],
    }),

    setDefaultClientAccessMethod: builder.mutation<ApiResponse<ClientAccessMethod>, string>({
      query: (id) => ({
        url: `/clients/access-methods/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: ["Client"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdminDashboardStatsQuery,
  useGetAdminClientsQuery,
  useGetAdminClientByIdQuery,
  useSendInvitationMutation,
  useGetAdminAgreementsQuery,
  useSendAgreementReminderMutation,
  useDeleteAdminAgreementMutation,
  useGetClientAccessMethodsQuery,
  useAddClientAccessMethodMutation,
  useUpdateClientAccessMethodMutation,
  useDeleteClientAccessMethodMutation,
  useSetDefaultClientAccessMethodMutation,
} = clientApi;
