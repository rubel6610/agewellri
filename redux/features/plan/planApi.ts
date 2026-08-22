import { baseApi } from "@/redux/api/baseApi";
import {
  ActivePlan,
  AdminPlan,
  AdminPlanDetail,
  ServiceItem,
  CreatePlanPayload,
  UpdatePlanPayload,
  ChangePlanStatusPayload,
  CreateServicePayload,
  UpdateServicePayload,
} from "./planTypes";

export const planApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public / Client: Active service plans for agreement & pricing
    getActivePlans: builder.query<ActivePlan[], void>({
      query: () => ({
        url: "/plans/active",
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: ActivePlan[] }) =>
        response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Plan" as const, id })),
              { type: "Plan", id: "ACTIVE" },
            ]
          : [{ type: "Plan", id: "ACTIVE" }],
    }),

    // Admin: List all plans with version & subscriber counts
    getAdminPlans: builder.query<AdminPlan[], void>({
      query: () => ({
        url: "/plans/admin/all",
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: AdminPlan[] }) =>
        response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Plan" as const, id })),
              { type: "Plan", id: "ADMIN_LIST" },
            ]
          : [{ type: "Plan", id: "ADMIN_LIST" }],
    }),

    // Admin: View full plan details with version history & subscribers
    getAdminPlanById: builder.query<AdminPlanDetail, string>({
      query: (id) => ({
        url: `/plans/admin/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: AdminPlanDetail }) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "Plan", id }],
    }),

    // Admin: Create new dynamic plan
    createPlan: builder.mutation<AdminPlanDetail, CreatePlanPayload>({
      query: (body) => ({
        url: "/plans/admin",
        method: "POST",
        body,
      }),
      transformResponse: (response: { success: boolean; data: AdminPlanDetail }) =>
        response.data,
      invalidatesTags: [{ type: "Plan", id: "ACTIVE" }, { type: "Plan", id: "ADMIN_LIST" }],
    }),

    // Admin: Edit dynamic plan (auto versioning if subscribers exist)
    updatePlan: builder.mutation<AdminPlanDetail, { id: string; body: UpdatePlanPayload }>({
      query: ({ id, body }) => ({
        url: `/plans/admin/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { success: boolean; data: AdminPlanDetail }) =>
        response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Plan", id },
        { type: "Plan", id: "ACTIVE" },
        { type: "Plan", id: "ADMIN_LIST" },
        "Subscription",
        "Billing",
      ],
    }),

    // Admin: Change plan status (DRAFT / ACTIVE / INACTIVE / ARCHIVED)
    changePlanStatus: builder.mutation<void, { id: string; body: ChangePlanStatusPayload }>({
      query: ({ id, body }) => ({
        url: `/plans/admin/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Plan", id },
        { type: "Plan", id: "ACTIVE" },
        { type: "Plan", id: "ADMIN_LIST" },
      ],
    }),

    // Dynamic Service Catalog
    getAllServices: builder.query<ServiceItem[], void>({
      query: () => ({
        url: "/plans/services/all",
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: ServiceItem[] }) =>
        response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Service" as const, id })),
              { type: "Service", id: "LIST" },
            ]
          : [{ type: "Service", id: "LIST" }],
    }),

    createService: builder.mutation<ServiceItem, CreateServicePayload>({
      query: (body) => ({
        url: "/plans/services",
        method: "POST",
        body,
      }),
      transformResponse: (response: { success: boolean; data: ServiceItem }) =>
        response.data,
      invalidatesTags: [{ type: "Service", id: "LIST" }, { type: "Plan", id: "ACTIVE" }, { type: "Plan", id: "ADMIN_LIST" }],
    }),

    updateService: builder.mutation<ServiceItem, { id: string; body: UpdateServicePayload }>({
      query: ({ id, body }) => ({
        url: `/plans/services/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: { success: boolean; data: ServiceItem }) =>
        response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Service", id },
        { type: "Service", id: "LIST" },
        { type: "Plan", id: "ACTIVE" },
        { type: "Plan", id: "ADMIN_LIST" },
      ],
    }),
  }),
});

export const {
  useGetActivePlansQuery,
  useGetAdminPlansQuery,
  useGetAdminPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useChangePlanStatusMutation,
  useGetAllServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
} = planApi;
