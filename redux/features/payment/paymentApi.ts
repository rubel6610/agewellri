import { baseApi } from "../../api/baseApi";
import {
  ApiResponse,
  StripeConfigData,
  CreateSetupIntentRequest,
  SetupIntentData,
  CreatePaymentIntentRequest,
  PaymentIntentData,
  SavePaymentMethodRequest,
  PaymentMethodsData,
  BillingOverviewData,
  ClientVisitEntitlementsResponse,
  ProcessAgreementPaymentRequest,
  ProcessAgreementPaymentData,
  CreateInvoicePaymentRequest,
  CancelRenewalRequest,
  CancelRenewalData,
  ReactivateRenewalData,
  AdminOverviewData,
  AdminInvoicesResponse,
  AdminSubscriptionsResponse,
  AdminUpcomingRenewalsResponse,
  AdminTriggerRemindersResponse,
  AdminRetryChargeRequest,
  AdminRetryChargeData,
} from "./paymentTypes";


export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStripeConfig: builder.query<ApiResponse<StripeConfigData>, void>({
      query: () => ({
        url: "/payments/config",
        method: "GET",
      }),
    }),

    createSetupIntent: builder.mutation<
      ApiResponse<SetupIntentData>,
      CreateSetupIntentRequest | void
    >({
      query: (body) => ({
        url: "/payments/create-setup-intent",
        method: "POST",
        body: body || {},
      }),
    }),

    createPaymentIntent: builder.mutation<
      ApiResponse<PaymentIntentData>,
      CreatePaymentIntentRequest
    >({
      query: (body) => ({
        url: "/payments/create-payment-intent",
        method: "POST",
        body,
      }),
    }),

    savePaymentMethod: builder.mutation<
      ApiResponse<{ success: boolean; paymentMethodId: string; card: any }>,
      SavePaymentMethodRequest
    >({
      query: (body) => ({
        url: "/payments/save-payment-method",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Billing", "Profile", "User"],
    }),

    getPaymentMethods: builder.query<ApiResponse<PaymentMethodsData>, void>({
      query: () => ({
        url: "/payments/payment-methods",
        method: "GET",
      }),
      providesTags: ["Billing"],
    }),

    getBillingOverview: builder.query<ApiResponse<BillingOverviewData>, void>({
      query: () => ({
        url: "/payments/billing-info",
        method: "GET",
      }),
      providesTags: ["Billing", "Subscription"],
    }),

    getVisitEntitlements: builder.query<ApiResponse<ClientVisitEntitlementsResponse>, void>({
      query: () => ({
        url: "/payments/visit-entitlements",
        method: "GET",
      }),
      providesTags: ["Subscription", "Billing"],
    }),

    processAgreementPayment: builder.mutation<
      ApiResponse<ProcessAgreementPaymentData>,
      ProcessAgreementPaymentRequest
    >({
      query: (body) => ({
        url: "/payments/process-agreement-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User", "Profile", "Agreement", "Billing", "Subscription"],
    }),

    createInvoicePayment: builder.mutation<
      ApiResponse<ProcessAgreementPaymentData>,
      CreateInvoicePaymentRequest
    >({
      query: (body) => ({
        url: "/payments/create-invoice-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Billing", "Subscription", "Agreement"],
    }),

    cancelSubscriptionRenewal: builder.mutation<
      ApiResponse<CancelRenewalData>,
      CancelRenewalRequest | void
    >({
      query: (body) => ({
        url: "/payments/subscription/cancel-renewal",
        method: "POST",
        body: body || {},
      }),
      invalidatesTags: ["Billing", "Subscription"],
    }),

    reactivateSubscriptionRenewal: builder.mutation<
      ApiResponse<ReactivateRenewalData>,
      void
    >({
      query: () => ({
        url: "/payments/subscription/reactivate-renewal",
        method: "POST",
      }),
      invalidatesTags: ["Billing", "Subscription"],
    }),

    getAdminBillingOverview: builder.query<ApiResponse<AdminOverviewData>, void>({
      query: () => ({
        url: "/payments/admin/overview",
        method: "GET",
      }),
      providesTags: ["Billing"],
    }),

    getAdminInvoices: builder.query<
      ApiResponse<AdminInvoicesResponse>,
      { status?: string; billingMethod?: string; plan?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/payments/admin/invoices",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Billing"],
    }),

    getAdminSubscriptions: builder.query<
      ApiResponse<AdminSubscriptionsResponse>,
      { status?: string; plan?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/payments/admin/subscriptions",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Subscription", "Billing"],
    }),

    getAdminUpcomingRenewals: builder.query<
      ApiResponse<AdminUpcomingRenewalsResponse>,
      { interval?: string; billingMethod?: string; daysRange?: number } | void
    >({
      query: (params) => ({
        url: "/payments/admin/renewals",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Subscription", "Billing"],
    }),

    adminTriggerReminders: builder.mutation<
      ApiResponse<AdminTriggerRemindersResponse>,
      void
    >({
      query: () => ({
        url: "/payments/admin/trigger-reminders",
        method: "POST",
      }),
      invalidatesTags: ["Billing", "Subscription"],
    }),

    adminRetryCharge: builder.mutation<
      ApiResponse<AdminRetryChargeData>,
      AdminRetryChargeRequest
    >({
      query: (body) => ({
        url: "/payments/admin/retry-charge",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Billing", "Subscription"],
    }),

    adminCancelSubscription: builder.mutation<
      ApiResponse<any>,
      { id: string; immediate?: boolean; reason?: string }
    >({
      query: ({ id, immediate, reason }) => ({
        url: `/payments/admin/subscription/${id}/cancel`,
        method: "POST",
        body: { immediate, reason },
      }),
      invalidatesTags: ["Billing", "Subscription", "Appointment"],
    }),

    adminReactivateSubscription: builder.mutation<
      ApiResponse<any>,
      string
    >({
      query: (id) => ({
        url: `/payments/admin/subscription/${id}/reactivate`,
        method: "POST",
      }),
      invalidatesTags: ["Billing", "Subscription"],
    }),

    adminUpdateSubscriptionStatus: builder.mutation<
      ApiResponse<any>,
      { id: string; status: string; reason?: string }
    >({
      query: ({ id, status, reason }) => ({
        url: `/payments/admin/subscription/${id}/status`,
        method: "POST",
        body: { status, reason },
      }),
      invalidatesTags: ["Billing", "Subscription"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetStripeConfigQuery,
  useCreateSetupIntentMutation,
  useCreatePaymentIntentMutation,
  useSavePaymentMethodMutation,
  useGetPaymentMethodsQuery,
  useGetBillingOverviewQuery,
  useGetVisitEntitlementsQuery,
  useProcessAgreementPaymentMutation,
  useCreateInvoicePaymentMutation,
  useCancelSubscriptionRenewalMutation,
  useReactivateSubscriptionRenewalMutation,
  useGetAdminBillingOverviewQuery,
  useGetAdminInvoicesQuery,
  useGetAdminSubscriptionsQuery,
  useGetAdminUpcomingRenewalsQuery,
  useAdminTriggerRemindersMutation,
  useAdminRetryChargeMutation,
  useAdminCancelSubscriptionMutation,
  useAdminReactivateSubscriptionMutation,
  useAdminUpdateSubscriptionStatusMutation,
} = paymentApi;

