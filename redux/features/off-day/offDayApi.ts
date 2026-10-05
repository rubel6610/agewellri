import { baseApi } from "../../api/baseApi";
import {
  OffDayItem,
  AdminOffDaysResponse,
  CreateOffDayPayload,
  UpdateOffDayPayload,
  PreviewConflictsPayload,
  PreviewConflictsResponse,
} from "./offDayTypes";

export const offDayApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // CLIENT / PUBLIC: Get active off-days for date picker and calendars
    getActiveOffDays: builder.query<OffDayItem[], { year?: number; month?: number } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.year) queryParams.append("year", String(params.year));
        if (params?.month) queryParams.append("month", String(params.month));
        const qs = queryParams.toString();
        return {
          url: `/off-days${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: { success: boolean; data: OffDayItem[] }) =>
        response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "OffDay" as const, id })),
              { type: "OffDay", id: "LIST" },
            ]
          : [{ type: "OffDay", id: "LIST" }],
    }),

    // ADMIN: Get all off-days with metrics & pagination
    getAdminOffDays: builder.query<
      AdminOffDaysResponse,
      {
        search?: string;
        year?: string;
        isActive?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append("search", params.search);
        if (params?.year) queryParams.append("year", params.year);
        if (params?.isActive) queryParams.append("isActive", params.isActive);
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.limit) queryParams.append("limit", String(params.limit));
        const qs = queryParams.toString();
        return {
          url: `/off-days/admin${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        success: boolean;
        data: OffDayItem[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          metrics: any;
        };
      }) => ({
        items: response.data || [],
        total: response.meta?.total || 0,
        page: response.meta?.page || 1,
        limit: response.meta?.limit || 100,
        totalPages: response.meta?.totalPages || 1,
        metrics: response.meta?.metrics || {
          totalActive: 0,
          upcomingCount: 0,
          thisMonthCount: 0,
          recurringCount: 0,
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({ type: "OffDay" as const, id })),
              { type: "OffDay", id: "ADMIN_LIST" },
            ]
          : [{ type: "OffDay", id: "ADMIN_LIST" }],
    }),

    // ADMIN: Get single off-day by ID
    getOffDayById: builder.query<OffDayItem, string>({
      query: (id) => ({
        url: `/off-days/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: OffDayItem }) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "OffDay", id }],
    }),

    // ADMIN: Preview conflicts for a proposed date range
    previewOffDayConflicts: builder.mutation<
      PreviewConflictsResponse,
      PreviewConflictsPayload
    >({
      query: (body) => ({
        url: "/off-days/preview-conflicts",
        method: "POST",
        body,
      }),
      transformResponse: (response: {
        success: boolean;
        data: PreviewConflictsResponse;
      }) => response.data,
    }),

    // ADMIN: Create new Off-Day
    createOffDay: builder.mutation<
      { success: boolean; message: string; data: OffDayItem },
      CreateOffDayPayload
    >({
      query: (body) => ({
        url: "/off-days",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "OffDay", id: "LIST" },
        { type: "OffDay", id: "ADMIN_LIST" },
      ],
    }),

    // ADMIN: Update Off-Day
    updateOffDay: builder.mutation<
      { success: boolean; message: string; data: OffDayItem },
      { id: string; data: UpdateOffDayPayload }
    >({
      query: ({ id, data }) => ({
        url: `/off-days/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "OffDay", id },
        { type: "OffDay", id: "LIST" },
        { type: "OffDay", id: "ADMIN_LIST" },
      ],
    }),

    // ADMIN: Delete Off-Day
    deleteOffDay: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/off-days/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "OffDay", id },
        { type: "OffDay", id: "LIST" },
        { type: "OffDay", id: "ADMIN_LIST" },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetActiveOffDaysQuery,
  useGetAdminOffDaysQuery,
  useGetOffDayByIdQuery,
  usePreviewOffDayConflictsMutation,
  useCreateOffDayMutation,
  useUpdateOffDayMutation,
  useDeleteOffDayMutation,
} = offDayApi;
