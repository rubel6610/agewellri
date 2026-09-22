import { baseApi } from "../../api/baseApi";
import { ApiResponse } from "../auth/authTypes";
import {
  GetNotificationsQueryParams,
  GetNotificationsResponse,
  UnreadCountResponse,
} from "./notificationTypes";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      ApiResponse<GetNotificationsResponse>,
      GetNotificationsQueryParams | void
    >({
      query: (params) => ({
        url: "/notifications",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Notification"],
    }),

    getUnreadCount: builder.query<ApiResponse<UnreadCountResponse>, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["NotificationUnreadCount"],
    }),

    markNotificationRead: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification", "NotificationUnreadCount"],
    }),

    markAllNotificationsRead: builder.mutation<
      ApiResponse<{ success: boolean; updatedCount: number }>,
      void
    >({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification", "NotificationUnreadCount"],
    }),

    deleteNotification: builder.mutation<ApiResponse<{ success: boolean }>, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification", "NotificationUnreadCount"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;
