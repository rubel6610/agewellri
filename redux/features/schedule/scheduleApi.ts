import { baseApi } from "../../api/baseApi";
import {
  WeeklySchedule,
  UpdateWeeklySchedulePayload,
  ScheduleOverrideItem,
  OverridesListResponse,
  CreateOverridePayload,
  UpdateOverridePayload,
  DayAvailability,
  CalendarRangeResponse,
  ConflictingAppointmentItem,
} from "./scheduleTypes";

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Weekly Default Schedule
    getWeeklySchedule: builder.query<WeeklySchedule, void>({
      query: () => ({
        url: "/schedule/weekly",
        method: "GET",
      }),
      transformResponse: (res: { success: boolean; data: WeeklySchedule }) => res.data,
      providesTags: [{ type: "Schedule", id: "WEEKLY" }],
    }),

    // 2. Update Weekly Default Schedule (Admin)
    updateWeeklySchedule: builder.mutation<
      { success: boolean; message: string; data: WeeklySchedule },
      UpdateWeeklySchedulePayload
    >({
      query: (body) => ({
        url: "/schedule/weekly",
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        { type: "Schedule", id: "WEEKLY" },
        { type: "Schedule", id: "CALENDAR" },
        { type: "Schedule", id: "AVAILABILITY" },
        { type: "OffDay", id: "LIST" },
      ],
    }),

    // 3. Get Calendar Schedule for Date Range (Month / Week)
    getCalendarSchedule: builder.query<
      CalendarRangeResponse,
      { startDate: string; endDate: string; durationMinutes?: number; technicianId?: string }
    >({
      query: ({ startDate, endDate, durationMinutes, technicianId }) => {
        const params = new URLSearchParams();
        params.append("startDate", startDate);
        params.append("endDate", endDate);
        if (durationMinutes) params.append("durationMinutes", String(durationMinutes));
        if (technicianId) params.append("technicianId", technicianId);
        return {
          url: `/schedule/calendar?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (res: { success: boolean; data: CalendarRangeResponse }) => res.data,
      providesTags: [{ type: "Schedule", id: "CALENDAR" }],
    }),

    // 4. Get Authoritative Single Date Availability (Client & Modals)
    getDateAvailability: builder.query<
      DayAvailability,
      { date: string; durationMinutes?: number; clientId?: string; technicianId?: string }
    >({
      query: ({ date, durationMinutes, clientId, technicianId }) => {
        const params = new URLSearchParams();
        params.append("date", date);
        if (durationMinutes) params.append("durationMinutes", String(durationMinutes));
        if (clientId) params.append("clientId", clientId);
        if (technicianId) params.append("technicianId", technicianId);
        return {
          url: `/schedule/availability?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (res: { success: boolean; data: DayAvailability }) => res.data,
      providesTags: (_res, _err, { date }) => [
        { type: "Schedule", id: `DATE_${date}` },
        { type: "Schedule", id: "AVAILABILITY" },
      ],
    }),

    // 5. Get Schedule Overrides List (Admin)
    getScheduleOverrides: builder.query<
      OverridesListResponse,
      {
        search?: string;
        overrideType?: string;
        status?: string;
        isActive?: string;
        year?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.search) q.append("search", params.search);
        if (params?.overrideType) q.append("overrideType", params.overrideType);
        if (params?.status) q.append("status", params.status);
        if (params?.isActive) q.append("isActive", params.isActive);
        if (params?.year) q.append("year", params.year);
        if (params?.page) q.append("page", String(params.page));
        if (params?.limit) q.append("limit", String(params.limit));
        const qs = q.toString();
        return {
          url: `/schedule/overrides${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (res: {
        success: boolean;
        data: ScheduleOverrideItem[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          metrics: any;
        };
      }) => ({
        items: res.data || [],
        total: res.meta?.total || 0,
        page: res.meta?.page || 1,
        limit: res.meta?.limit || 100,
        totalPages: res.meta?.totalPages || 1,
        metrics: res.meta?.metrics || {
          totalActive: 0,
          closedCount: 0,
          customCount: 0,
          weekOverrideCount: 0,
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: "Schedule" as const, id })),
              { type: "Schedule", id: "OVERRIDES_LIST" },
            ]
          : [{ type: "Schedule", id: "OVERRIDES_LIST" }],
    }),

    // 6. Get Single Override by ID
    getScheduleOverrideById: builder.query<ScheduleOverrideItem, string>({
      query: (id) => ({
        url: `/schedule/overrides/${id}`,
        method: "GET",
      }),
      transformResponse: (res: { success: boolean; data: ScheduleOverrideItem }) => res.data,
      providesTags: (_res, _err, id) => [{ type: "Schedule", id }],
    }),

    // 7. Create Schedule Override
    createScheduleOverride: builder.mutation<
      { success: boolean; message: string; data: ScheduleOverrideItem },
      CreateOverridePayload
    >({
      query: (body) => ({
        url: "/schedule/overrides",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Schedule", id: "OVERRIDES_LIST" },
        { type: "Schedule", id: "CALENDAR" },
        { type: "Schedule", id: "AVAILABILITY" },
        { type: "OffDay", id: "LIST" },
        { type: "OffDay", id: "ADMIN_LIST" },
      ],
    }),

    // 8. Update Schedule Override
    updateScheduleOverride: builder.mutation<
      { success: boolean; message: string; data: ScheduleOverrideItem },
      { id: string; data: UpdateOverridePayload }
    >({
      query: ({ id, data }) => ({
        url: `/schedule/overrides/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Schedule", id },
        { type: "Schedule", id: "OVERRIDES_LIST" },
        { type: "Schedule", id: "CALENDAR" },
        { type: "Schedule", id: "AVAILABILITY" },
        { type: "OffDay", id: "LIST" },
        { type: "OffDay", id: "ADMIN_LIST" },
      ],
    }),

    // 9. Delete Schedule Override
    deleteScheduleOverride: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/schedule/overrides/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Schedule", id },
        { type: "Schedule", id: "OVERRIDES_LIST" },
        { type: "Schedule", id: "CALENDAR" },
        { type: "Schedule", id: "AVAILABILITY" },
        { type: "OffDay", id: "LIST" },
        { type: "OffDay", id: "ADMIN_LIST" },
      ],
    }),

    // 10. Preview Conflicts
    previewScheduleConflicts: builder.mutation<
      { conflicts: ConflictingAppointmentItem[]; conflictCount: number },
      { startDate: string; endDate?: string }
    >({
      query: (body) => ({
        url: "/schedule/preview-conflicts",
        method: "POST",
        body,
      }),
      transformResponse: (res: {
        success: boolean;
        data: { conflicts: ConflictingAppointmentItem[]; conflictCount: number };
      }) => res.data,
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetWeeklyScheduleQuery,
  useUpdateWeeklyScheduleMutation,
  useGetCalendarScheduleQuery,
  useGetDateAvailabilityQuery,
  useGetScheduleOverridesQuery,
  useGetScheduleOverrideByIdQuery,
  useCreateScheduleOverrideMutation,
  useUpdateScheduleOverrideMutation,
  useDeleteScheduleOverrideMutation,
  usePreviewScheduleConflictsMutation,
} = scheduleApi;
