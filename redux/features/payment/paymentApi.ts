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
  ProcessAgreementPaymentRequest,
  ProcessAgreementPaymentData,
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
  useProcessAgreementPaymentMutation,
} = paymentApi;
