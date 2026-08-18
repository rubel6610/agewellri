import { baseApi } from "../../api/baseApi";
import {
  ApiResponse,
  AuthResponseData,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
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
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useChangePasswordMutation,
} = authApi;
