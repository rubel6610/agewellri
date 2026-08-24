import { baseApi } from "../../api/baseApi";
import { ApiResponse, AuthResponseData, AgreementDocument } from "../auth/authTypes";
import { setCredentials } from "../auth/authSlice";

export interface VerifyInvitationResponse {
  valid: boolean;
  email: string;
  clientId?: string;
  expiresAt: string;
  prefillData?: {
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
    address: string;
    city: string;
    postalCode: string;
  } | null;
}

export interface AcceptInvitationRequest {
  token: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  state?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface OnboardingStateResponse {
  userId: string;
  clientId: string;
  clientNumber: string;
  onboardingStatus: string;
  onboardingStep: number;
  onboardingData?: Record<string, any> | null;
  hasCompletedAgreement: boolean;
  primaryClient: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    dateOfBirth?: string;
  };
  signer: {
    signerRole: string;
    legalAuthority?: string;
    legalAuthorityOther?: string;
  };
  emergencyContact: {
    name?: string;
    phone?: string;
    email?: string;
    relation?: string;
  };
  homeAccess: {
    type: string;
    instructions?: string;
    code?: string;
  };
  agreement?: {
    id: string;
    status: string;
    state: string;
    templateVersion: string;
    cancellationDeadline: string;
    signedAt?: string;
    executedAt?: string;
  } | null;
}

export interface StateAgreementTemplateResponse {
  template: {
    id: string;
    state: string;
    title: string;
    description?: string;
  };
  activeVersion: {
    id: string;
    versionNumber: string;
    title: string;
    statutoryReference: string;
    content?: string;
  };
  state: string;
  statutoryReference: string;
}

export interface CancellationDeadlineResponse {
  deadlineDate: string;
  formattedDeadline: string;
  ruleExplanation: string;
  businessDaysCounted: number;
  state: string;
  effectiveFrom: string;
}

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    verifyInvitationToken: builder.query<ApiResponse<VerifyInvitationResponse>, string>({
      query: (token) => `/invitations/verify/${token}`,
      keepUnusedDataFor: 600,
    }),

    acceptInvitation: builder.mutation<ApiResponse<AuthResponseData>, AcceptInvitationRequest>({
      query: (body) => ({
        url: "/invitations/accept",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User", "Profile", "Client"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data) {
            dispatch(
              setCredentials({
                user: data.data.user,
                token: data.data.token,
                refreshToken: data.data.refreshToken,
              })
            );
          }
        } catch {
          // Handled in component
        }
      },
    }),

    getOnboardingState: builder.query<ApiResponse<OnboardingStateResponse>, void>({
      query: () => "/invitations/onboarding/state",
      keepUnusedDataFor: 300,
      providesTags: ["Client", "Agreement"],
    }),

    saveOnboardingProgress: builder.mutation<
      ApiResponse<{ success: boolean; step: number }>,
      { step: number; onboardingData: Record<string, any> }
    >({
      query: (body) => ({
        url: "/invitations/onboarding/save-progress",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Client"],
    }),

    getStateAgreementTemplate: builder.query<ApiResponse<StateAgreementTemplateResponse>, string>({
      query: (state) => `/agreements/template/${state}`,
      keepUnusedDataFor: 3600,
    }),

    calculateCancellationDeadline: builder.query<
      ApiResponse<CancellationDeadlineResponse>,
      { state: string; date?: string }
    >({
      query: ({ state, date }) => {
        let url = `/agreements/calculate-deadline?state=${encodeURIComponent(state)}`;
        if (date) url += `&date=${encodeURIComponent(date)}`;
        return url;
      },
      keepUnusedDataFor: 1800,
    }),
  }),
});

export const {
  useVerifyInvitationTokenQuery,
  useLazyVerifyInvitationTokenQuery,
  useAcceptInvitationMutation,
  useGetOnboardingStateQuery,
  useSaveOnboardingProgressMutation,
  useGetStateAgreementTemplateQuery,
  useCalculateCancellationDeadlineQuery,
  useLazyCalculateCancellationDeadlineQuery,
} = onboardingApi;
