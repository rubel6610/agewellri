import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken } from "@/lib/auth/token";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // Extract token from Redux state or fall back to cookie/localStorage
      const state = getState() as { auth?: { token?: string | null } };
      const token = state.auth?.token || getAuthToken();

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      headers.set("Accept", "application/json");
      return headers;
    },
  }),
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
  ],
  endpoints: () => ({}),
});
