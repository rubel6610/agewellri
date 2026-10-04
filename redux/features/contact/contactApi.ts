import { baseApi } from "../../api/baseApi";

export interface SendContactMessageInput {
  topic?: string;
  subject: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
}

export interface SendContactMessageResponse {
  success: boolean;
  message: string;
  data?: {
    clientEmail?: string;
  };
}

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation<SendContactMessageResponse, SendContactMessageInput>({
      query: (body) => ({
        url: "/contact/send",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useSendContactMessageMutation } = contactApi;
