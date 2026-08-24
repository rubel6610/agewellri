import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { getAuthToken, getRefreshToken } from "@/lib/auth/token";
import { setCredentials, logout } from "../features/auth/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://arfanrubel5173.ilmifygroup.com/api/v1",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth?: { token?: string | null } };
    const token = state.auth?.token || getAuthToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Accept", "application/json");
    return headers;
  },
});

// Mutex / promise lock for handling concurrent 401 refresh requests
let refreshPromise: Promise<boolean> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // If there's an ongoing refresh, wait for it before proceeding
  if (refreshPromise) {
    await refreshPromise;
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  // If request failed with 401 Unauthorized (and wasn't the refresh-token endpoint itself)
  const isRefreshEndpoint =
    typeof args === "string"
      ? args.includes("refresh-token") || args.includes("refresh")
      : args.url.includes("refresh-token") || args.url.includes("refresh");

  if (result.error && result.error.status === 401 && !isRefreshEndpoint) {
    const state = api.getState() as { auth?: { refreshToken?: string | null } };
    const refreshToken = state.auth?.refreshToken || getRefreshToken();

    if (refreshToken) {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshResult = await rawBaseQuery(
              {
                url: "/auth/refresh-token",
                method: "POST",
                body: { refreshToken },
              },
              api,
              extraOptions
            );

            if (refreshResult.data) {
              const data = refreshResult.data as {
                success: boolean;
                data: {
                  token: string;
                  refreshToken?: string;
                  user: any;
                };
              };

              if (data.success && data.data?.token) {
                api.dispatch(
                  setCredentials({
                    user: data.data.user,
                    token: data.data.token,
                    refreshToken: data.data.refreshToken || refreshToken,
                  })
                );
                return true;
              }
            }

            // Refresh failed
            api.dispatch(logout());
            return false;
          } catch {
            api.dispatch(logout());
            return false;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const refreshed = await refreshPromise;

      if (refreshed) {
        // Retry original query with refreshed token
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } else {
      // No refresh token available -> log out
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithReauth,
  // 5 minutes default retention for unused cache entries (prevents refetching when switching tabs)
  keepUnusedDataFor: 300,
  refetchOnFocus: false,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: false,
  tagTypes: [
    "Auth",
    "User",
    "Profile",
    "Client",
    "Appointment",
    "Report",
    "Agreement",
    "Billing",
    "Subscription",
    "Notification",
    "Plan",
    "Service",
    "Specialist",
  ],
  endpoints: () => ({}),
});
