import { baseApi } from "@/redux/api/baseApi";
import {
  ActivePlan,
  AdminPlan,
  AdminPlanDetail,
  CreatePlanPayload,
  UpdatePlanPayload,
  ChangePlanStatusPayload,
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

    // Admin: List all plans with subscriber counts
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

    // Admin: View full plan details and subscribers
    getAdminPlanById: builder.query<AdminPlanDetail, string>({
      query: (id) => ({
        url: `/plans/admin/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: AdminPlanDetail }) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "Plan", id }],
    }),

    // Admin: Create new service plan
    createPlan: builder.mutation<AdminPlanDetail, CreatePlanPayload>({
      query: (body) => ({
        url: "/plans/admin",
        method: "POST",
        body,
      }),
      transformResponse: (response: { success: boolean; data: AdminPlanDetail }) =>
        response.data,
      invalidatesTags: [
        { type: "Plan", id: "ACTIVE" },
        { type: "Plan", id: "ADMIN_LIST" },
      ],
    }),

    // Admin: Edit service plan
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

    // Admin: Change plan status (ACTIVE / INACTIVE / ARCHIVED)
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

    // Admin: Delete a service plan permanently
    deletePlan: builder.mutation<{ message: string; success: boolean }, string>({
      query: (id) => ({
        url: `/plans/admin/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { success: boolean; data: any; message: string }) => ({
        success: response.success,
        message: response.message,
      }),
      invalidatesTags: [
        { type: "Plan", id: "ACTIVE" },
        { type: "Plan", id: "ADMIN_LIST" },
        "Subscription",
        "Billing",
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
  useDeletePlanMutation,
} = planApi;
