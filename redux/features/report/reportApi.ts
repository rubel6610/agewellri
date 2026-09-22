import { baseApi } from "../../api/baseApi";
import { ApiResponse } from "../auth/authTypes";
import {
  AssessmentTemplateData,
  SubmitAssessmentRequest,
  UploadReportRequest,
  ReportItem,
} from "./reportTypes";

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadReport: builder.mutation<ApiResponse<ReportItem>, FormData | UploadReportRequest>({
      query: (arg) => {
        let body: FormData;
        if (arg instanceof FormData) {
          body = arg;
        } else {
          body = new FormData();
          body.append("appointmentId", arg.appointmentId);
          body.append("file", arg.file);
          if (arg.title) body.append("title", arg.title);
          if (arg.summary) body.append("summary", arg.summary);
          if (arg.notes) body.append("notes", arg.notes);
        }

        return {
          url: "/reports/upload",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Report", "Appointment", "Client"],
    }),

    getAssessmentTemplate: builder.query<ApiResponse<AssessmentTemplateData>, void>({
      query: () => ({
        url: "/reports/template",
        method: "GET",
      }),
      providesTags: ["Report"],
    }),

    submitAssessment: builder.mutation<ApiResponse<ReportItem>, SubmitAssessmentRequest>({
      query: (body) => ({
        url: "/reports/assessment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Report", "Appointment", "Client"],
    }),

    getReportByAppointmentId: builder.query<ApiResponse<ReportItem | null>, string>({
      query: (appointmentId) => ({
        url: `/reports/appointment/${appointmentId}`,
        method: "GET",
      }),
      providesTags: ["Report"],
    }),

    getMyReports: builder.query<ApiResponse<ReportItem[]>, void>({
      query: () => ({
        url: "/reports/my",
        method: "GET",
      }),
      providesTags: ["Report"],
    }),

    getAdminReports: builder.query<
      ApiResponse<ReportItem[]>,
      {
        search?: string;
        status?: string;
        clientId?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: "/reports/admin/all",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Report"],
    }),

    getReportById: builder.query<ApiResponse<ReportItem>, string>({
      query: (id) => ({
        url: `/reports/${id}`,
        method: "GET",
      }),
      providesTags: ["Report"],
    }),

    deleteAdminReport: builder.mutation<ApiResponse<{ success: boolean; message: string }>, string>({
      query: (reportId) => ({
        url: `/reports/admin/${reportId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Report", "Appointment", "Client"],
    }),
  }),
});

export const {
  useUploadReportMutation,
  useGetAssessmentTemplateQuery,
  useSubmitAssessmentMutation,
  useGetReportByAppointmentIdQuery,
  useGetMyReportsQuery,
  useGetAdminReportsQuery,
  useGetReportByIdQuery,
  useDeleteAdminReportMutation,
} = reportApi;

