import { baseApi } from "../../api/baseApi";
import { ApiResponse } from "../auth/authTypes";
import {
  AppointmentItem,
  ScheduleAppointmentRequest,
  AdminScheduleAppointmentRequest,
  RescheduleAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "./appointmentTypes";

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAppointments: builder.query<ApiResponse<AppointmentItem[]>, void>({
      query: () => ({
        url: "/appointments/my",
        method: "GET",
      }),
      providesTags: ["Appointment"],
    }),

    getAdminAppointments: builder.query<
      ApiResponse<AppointmentItem[]>,
      {
        status?: string;
        clientId?: string;
        technicianId?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/appointments/admin",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Appointment"],
    }),

    getAppointmentById: builder.query<ApiResponse<AppointmentItem>, string>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: "GET",
      }),
      providesTags: ["Appointment"],
    }),

    scheduleAppointment: builder.mutation<ApiResponse<AppointmentItem>, ScheduleAppointmentRequest>({
      query: (body) => ({
        url: "/appointments/schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointment", "Subscription", "Billing", "Client", "Profile"],
    }),

    adminScheduleAppointment: builder.mutation<
      ApiResponse<AppointmentItem>,
      AdminScheduleAppointmentRequest
    >({
      query: (body) => ({
        url: "/appointments/admin/schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Appointment", "Subscription", "Billing", "Client"],
    }),

    rescheduleAppointment: builder.mutation<
      ApiResponse<AppointmentItem>,
      { id: string; body: RescheduleAppointmentRequest }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}/reschedule`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Appointment", "Subscription", "Billing"],
    }),

    cancelAppointment: builder.mutation<
      ApiResponse<AppointmentItem>,
      { id: string; reason?: string }
    >({
      query: ({ id, reason }) => ({
        url: `/appointments/${id}/cancel`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["Appointment", "Subscription", "Billing", "Client"],
    }),

    updateAppointmentStatus: builder.mutation<
      ApiResponse<AppointmentItem>,
      { id: string; body: UpdateAppointmentStatusRequest }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Appointment", "Subscription", "Billing", "Client"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetMyAppointmentsQuery,
  useGetAdminAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useScheduleAppointmentMutation,
  useAdminScheduleAppointmentMutation,
  useRescheduleAppointmentMutation,
  useCancelAppointmentMutation,
  useUpdateAppointmentStatusMutation,
} = appointmentApi;
