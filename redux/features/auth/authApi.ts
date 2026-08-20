import { baseApi } from "../../api/baseApi";
import {
  ApiResponse,
  AuthResponseData,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  SubmitAgreementRequest,
  AgreementDocument,
  ForgotPasswordRequest,
  VerifyOtpRequest,
  ResetPasswordRequest,
  RefreshTokenRequest,
} from "./authTypes";
import { setCredentials, setUser } from "./authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponseData>, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth", "User", "Profile"],
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
          // Errors handled in component UI
        }
      },
    }),

    register: builder.mutation<ApiResponse<AuthResponseData>, RegisterRequest>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Auth", "User", "Profile"],
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
          // Errors handled in component UI
        }
      },
    }),

    getMe: builder.query<ApiResponse<AuthUser>, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["User", "Profile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data) {
            dispatch(setUser(data.data));
          }
        } catch {
          // Handled gracefully
        }
      },
    }),

    updateProfile: builder.mutation<ApiResponse<AuthUser>, UpdateProfileRequest>({
      query: (body) => ({
        url: "/auth/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User", "Profile"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data) {
            dispatch(setUser(data.data));
          }
        } catch {
          // Handled in component
        }
      },
    }),

    submitAgreement: builder.mutation<
      ApiResponse<{ agreement: any; user: AuthUser }>,
      SubmitAgreementRequest
    >({
      query: (body) => ({
        url: "/auth/agreement",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User", "Profile", "Agreement"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.success && data?.data?.user) {
            dispatch(setUser(data.data.user));
          }
        } catch {
          // Handled in component
        }
      },
    }),

    getMyAgreement: builder.query<ApiResponse<AgreementDocument>, void>({
      query: () => ({
        url: "/auth/my-agreement",
        method: "GET",
      }),
      providesTags: ["Agreement", "User"],
    }),

    forgotPassword: builder.mutation<ApiResponse<{ email: string }>, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    verifyOtp: builder.mutation<ApiResponse<{ success: boolean; email: string }>, VerifyOtpRequest>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<{ success: boolean; message: string }>, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    refreshToken: builder.mutation<ApiResponse<AuthResponseData>, RefreshTokenRequest>({
      query: (body) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Profile"],
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
          // Handled gracefully
        }
      },
    }),

    changePassword: builder.mutation<
      ApiResponse<{ message: string }>,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PATCH",
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useUpdateProfileMutation,
  useSubmitAgreementMutation,
  useGetMyAgreementQuery,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useChangePasswordMutation,
} = authApi;





