import { baseApi } from "../../api/baseApi";
import { ApiResponse } from "../auth/authTypes";
import {
  FamilyMemberItem,
  FamilyMembersResponseData,
  CreateFamilyMemberRequest,
  UpdateFamilyMemberRequest,
  VerifyFamilyInviteResponseData,
  AcceptFamilyInviteRequest,
  SendReportToFamilyRequest,
} from "./familyTypes";

export const familyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyFamilyMembers: builder.query<ApiResponse<FamilyMemberItem[]>, void>({
      query: () => ({
        url: "/family-members",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<FamilyMembersResponseData | FamilyMemberItem[]>) => {
        if (response.data && "familyMembers" in response.data) {
          return {
            ...response,
            data: response.data.familyMembers,
          } as ApiResponse<FamilyMemberItem[]>;
        }
        return response as ApiResponse<FamilyMemberItem[]>;
      },
      providesTags: ["FamilyMember", "Client"],
    }),

    getFamilyMemberById: builder.query<ApiResponse<FamilyMemberItem>, string>({
      query: (id) => ({
        url: `/family-members/${id}`,
        method: "GET",
      }),
      providesTags: ["FamilyMember"],
    }),

    createFamilyMember: builder.mutation<ApiResponse<FamilyMemberItem>, CreateFamilyMemberRequest>({
      query: (body) => ({
        url: "/family-members",
        method: "POST",
        body: {
          ...body,
          sendInviteNow: body.sendInviteNow ?? body.sendInvite ?? false,
        },
      }),
      invalidatesTags: ["FamilyMember", "Client"],
    }),

    updateFamilyMember: builder.mutation<
      ApiResponse<FamilyMemberItem>,
      { id: string; data: UpdateFamilyMemberRequest }
    >({
      query: ({ id, data }) => ({
        url: `/family-members/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["FamilyMember", "Client"],
    }),

    deleteFamilyMember: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/family-members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FamilyMember", "Client"],
    }),

    inviteFamilyMember: builder.mutation<
      ApiResponse<any>,
      string | { id: string; password?: string }
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const body = typeof arg === "string" ? undefined : { password: arg.password };
        return {
          url: `/family-members/${id}/invite`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["FamilyMember", "Client"],
    }),

    resendFamilyInvite: builder.mutation<
      ApiResponse<any>,
      string | { id: string; password?: string }
    >({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        const body = typeof arg === "string" ? undefined : { password: arg.password };
        return {
          url: `/family-members/${id}/resend-invite`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["FamilyMember", "Client"],
    }),

    revokeFamilyInvite: builder.mutation<ApiResponse<FamilyMemberItem>, string>({
      query: (id) => ({
        url: `/family-members/${id}/revoke-access`,
        method: "POST",
      }),
      invalidatesTags: ["FamilyMember", "Client"],
    }),

    verifyFamilyInvite: builder.query<
      ApiResponse<VerifyFamilyInviteResponseData>,
      string | { token: string; email?: string }
    >({
      query: (arg) => {
        const token = typeof arg === "string" ? arg : arg.token;
        const email = typeof arg === "string" ? undefined : arg.email;
        return {
          url: "/family-members/invitation/verify",
          method: "GET",
          params: email ? { token, email } : { token },
        };
      },
      transformResponse: (response: ApiResponse<VerifyFamilyInviteResponseData>) => {
        if (response.data) {
          const fm = response.data.familyMember;
          return {
            ...response,
            data: {
              ...response.data,
              name: fm?.name,
              email: fm?.email,
              relationship: fm?.relationship,
              phone: fm?.phone,
              permissions: {
                reportAccess: fm?.reportAccess ?? true,
                portalAccess: fm?.portalAccess ?? false,
                billingAccess: fm?.billingAccess ?? false,
              },
            },
          };
        }
        return response;
      },
    }),

    acceptFamilyInvite: builder.mutation<ApiResponse<any>, AcceptFamilyInviteRequest>({
      query: (body) => ({
        url: "/family-members/invitation/accept",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FamilyMember", "Client", "Auth"],
    }),

    sendReportToFamily: builder.mutation<
      ApiResponse<{ sentCount: number; message: string }>,
      | { reportId: string; data: SendReportToFamilyRequest }
      | {
          reportId: string;
          familyMemberIds: string[];
          additionalEmails?: string[];
          customMessage?: string;
        }
    >({
      query: (arg) => {
        const reportId = arg.reportId;
        const body =
          "data" in arg
            ? arg.data
            : {
                familyMemberIds: arg.familyMemberIds,
                customNote: arg.customMessage,
              };
        return {
          url: `/family-members/reports/${reportId}/send`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const {
  useGetMyFamilyMembersQuery,
  useGetFamilyMemberByIdQuery,
  useCreateFamilyMemberMutation,
  useUpdateFamilyMemberMutation,
  useDeleteFamilyMemberMutation,
  useInviteFamilyMemberMutation,
  useResendFamilyInviteMutation,
  useRevokeFamilyInviteMutation,
  useVerifyFamilyInviteQuery,
  useAcceptFamilyInviteMutation,
  useSendReportToFamilyMutation,
} = familyApi;

// Aliases for convenience
export const useGetFamilyMembersQuery = familyApi.useGetMyFamilyMembersQuery;
export const useAddFamilyMemberMutation = familyApi.useCreateFamilyMemberMutation;
export const useRevokeFamilyAccessMutation = familyApi.useRevokeFamilyInviteMutation;
