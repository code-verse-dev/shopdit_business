import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const flyersService = createApi({
  reducerPath: "flyersService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/business",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Flyers", "Flyer", "FlyerTemplates"],
  endpoints: (builder) => ({
    getFlyerTemplates: builder.query<any, void>({
      query: () => "/flyer-templates",
      providesTags: ["FlyerTemplates"],
      transformErrorResponse,
    }),
    getFlyers: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        businessProfileId?: string;
      }
    >({
      query: (params) => {
        const search = new URLSearchParams();
        if (params.page != null) search.set("page", String(params.page));
        if (params.limit != null) search.set("limit", String(params.limit));
        if (params.status) search.set("status", params.status);
        if (params.search) search.set("search", params.search);
        if (params.businessProfileId)
          search.set("businessProfileId", params.businessProfileId);
        const q = search.toString();
        return `/flyers${q ? `?${q}` : ""}`;
      },
      providesTags: ["Flyers"],
      transformErrorResponse,
    }),
    getFlyer: builder.query<any, string>({
      query: (id) => `/flyers/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Flyer", id }],
      transformErrorResponse,
    }),
    createFlyer: builder.mutation<
      any,
      {
        flyer_template_id: string;
        businessProfile_id: string;
        title: string;
        start_date: string;
        end_date: string;
        description?: string;
        zip_code?: string;
      }
    >({
      query: (body) => ({
        url: "/flyers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Flyers"],
      transformErrorResponse,
    }),
    updateFlyer: builder.mutation<
      any,
      {
        flyerId: string;
        title?: string;
        description?: string;
        start_date?: string;
        end_date?: string;
        zip_code?: string;
      }
    >({
      query: ({ flyerId, ...rest }) => ({
        url: `/flyers/${flyerId}`,
        method: "PUT",
        body: rest,
      }),
      invalidatesTags: (_result, _err, { flyerId }) => ["Flyers", { type: "Flyer", id: flyerId }],
      transformErrorResponse,
    }),
    patchFlyerSlot: builder.mutation<
      any,
      { flyerId: string; slotAssignmentId: string; body: Record<string, unknown> | FormData }
    >({
      query: ({ flyerId, slotAssignmentId, body }) => ({
        url: `/flyers/${flyerId}/slots/${slotAssignmentId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { flyerId }) => [{ type: "Flyer", id: flyerId }],
      transformErrorResponse,
    }),
    publishFlyer: builder.mutation<any, string>({
      query: (flyerId) => ({
        url: `/flyers/${flyerId}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _err, flyerId) => ["Flyers", { type: "Flyer", id: flyerId }],
      transformErrorResponse,
    }),
    unpublishFlyer: builder.mutation<any, string>({
      query: (flyerId) => ({
        url: `/flyers/${flyerId}/unpublish`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _err, flyerId) => ["Flyers", { type: "Flyer", id: flyerId }],
      transformErrorResponse,
    }),
    deleteFlyer: builder.mutation<any, string>({
      query: (id) => ({
        url: `/flyers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Flyers"],
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetFlyerTemplatesQuery,
  useGetFlyersQuery,
  useGetFlyerQuery,
  useCreateFlyerMutation,
  useUpdateFlyerMutation,
  usePatchFlyerSlotMutation,
  usePublishFlyerMutation,
  useUnpublishFlyerMutation,
  useDeleteFlyerMutation,
} = flyersService;
