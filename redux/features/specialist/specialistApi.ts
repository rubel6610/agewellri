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
      transformResponse: (response: { success: boolean; data: SpecialistItem[] }) =>
        response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Specialist" as const, id })),
              { type: "Specialist", id: "LIST" },
            ]
          : [{ type: "Specialist", id: "LIST" }],
    }),

    getSpecialistById: builder.query<SpecialistItem, string>({
      query: (id) => ({
        url: `/specialists/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { success: boolean; data: SpecialistItem }) =>
        response.data,
      providesTags: (_result, _error, id) => [{ type: "Specialist", id }],
    }),

    createSpecialist: builder.mutation<SpecialistItem, CreateSpecialistPayload>({
      query: (body) => ({
        url: "/specialists",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Specialist", id: "LIST" }, "Specialist"],
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
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Specialist", id },
        { type: "Specialist", id: "LIST" },
        "Specialist",
      ],
    }),

    deleteSpecialist: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/specialists/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Specialist", id },
        { type: "Specialist", id: "LIST" },
        "Specialist",
      ],
    }),

    assignSpecialist: builder.mutation<any, AssignSpecialistPayload>({
      query: (body) => ({
        url: "/specialists/assign",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Specialist", "Appointment"],
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
