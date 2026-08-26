import { baseApi } from "../../api/baseApi";
import {
  SpecialistItem,
  CreateSpecialistPayload,
  UpdateSpecialistPayload,
  AssignSpecialistPayload,
} from "./specialistTypes";

export const specialistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSpecialists: builder.query<SpecialistItem[], void>({
      query: () => ({
        url: "/specialists",
        method: "GET",
      }),
      keepUnusedDataFor: 1800,
      transformResponse: (response: { success: boolean; data: SpecialistItem[] }) =>
        response.data || [],
      providesTags: ["Specialist"],
    }),

    getSpecialistById: builder.query<SpecialistItem, string>({
      query: (id) => ({
        url: `/specialists/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 1800,
      transformResponse: (response: { success: boolean; data: SpecialistItem }) =>
        response.data,
      providesTags: ["Specialist"],
    }),

    createSpecialist: builder.mutation<SpecialistItem, CreateSpecialistPayload>({
      query: (body) => ({
        url: "/specialists",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Specialist"],
    }),

    updateSpecialist: builder.mutation<
      SpecialistItem,
      { id: string; data: UpdateSpecialistPayload }
    >({
      query: ({ id, data }) => ({
        url: `/specialists/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Specialist"],
    }),

    deleteSpecialist: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/specialists/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Specialist"],
    }),

    assignSpecialist: builder.mutation<any, AssignSpecialistPayload>({
      query: (body) => ({
        url: "/specialists/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Specialist"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAllSpecialistsQuery,
  useGetSpecialistByIdQuery,
  useCreateSpecialistMutation,
  useUpdateSpecialistMutation,
  useDeleteSpecialistMutation,
  useAssignSpecialistMutation,
} = specialistApi;
