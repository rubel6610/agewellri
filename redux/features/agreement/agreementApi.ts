import { baseApi } from "../../api/baseApi";
import { ApiResponse, AuthUser } from "../auth/authTypes";

export interface AuthorizedRecipient {
  name: string;
  relationship: string;
  email: string;
}

export interface UploadAuthorityDocResponse {
  fileUrl: string;
  originalName: string;
  size: number;
}

export interface SubmitAgreementPayload {
  clientFullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  dob?: string | null;
  email?: string;

  signingTrack?: "TRACK_A" | "TRACK_B";
  signerRole?: string;
  representativeCapacity?: "ATTORNEY_IN_FACT" | "GUARDIAN" | "CONSERVATOR" | null;
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

  authorizedRecipients?: AuthorizedRecipient[];

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;
  emergencyContactRelation?: string | null;

  homeAccessType?: "LOCKBOX" | "RESIDENT_ANSWERS" | "DIGITAL_CODE" | "OTHER";
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

export const agreementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadAuthorityDocument: builder.mutation<ApiResponse<UploadAuthorityDocResponse>, FormData>({
      query: (formData) => ({
        url: "/agreements/upload-authority-document",
        method: "POST",
        body: formData,
      }),
    }),

    submitAgreement: builder.mutation<
      ApiResponse<{ agreement: any; user: AuthUser }>,
      SubmitAgreementPayload
    >({
      query: (body) => ({
        url: "/agreements/sign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User", "Profile", "Agreement", "Client"],
    }),

    getMyAgreement: builder.query<ApiResponse<any>, void>({
      query: () => ({
        url: "/agreements/my-agreement",
        method: "GET",
      }),
      providesTags: ["Agreement"],
    }),

    getStateAgreementTemplate: builder.query<ApiResponse<any>, string>({
      query: (state) => `/agreements/template/${state}`,
      keepUnusedDataFor: 3600,
    }),
  }),
  overrideExisting: true,
});

export const {
  useUploadAuthorityDocumentMutation,
  useSubmitAgreementMutation,
  useGetMyAgreementQuery,
  useGetStateAgreementTemplateQuery,
} = agreementApi;
