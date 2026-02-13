import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const businessService = createApi({
  reducerPath: "businessService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/businessProfile",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["BusinessProfiles", "PointsStats"],
  refetchOnMountOrArgChange: true,

  endpoints: (builder) => ({
    getBusinessProfiles: builder.query<
      any,
      { businessId: string; page: number; limit: number }
    >({
      query: ({ businessId, page, limit }) =>
        `/${businessId}/profiles?page=${page}&limit=${limit}`,
      providesTags: ["BusinessProfiles"],
      transformErrorResponse,
    }),
    getPointsStats: builder.query<
      any,
      {
        businessProfileId?: string;
        from?: string;
        to?: string;
      }
    >({
      query: (params) => {
        const search = new URLSearchParams();
        if (params.businessProfileId)
          search.set("businessProfileId", params.businessProfileId);
        if (params.from) search.set("from", params.from);
        if (params.to) search.set("to", params.to);
        const q = search.toString();
        return `/getPointsStats${q ? `?${q}` : ""}`;
      },
      providesTags: ["PointsStats"],
      transformErrorResponse,
    }),
    createProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/createProfile",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["BusinessProfiles"],
      transformErrorResponse,
    }),
  }),
});

export const {
  useGetBusinessProfilesQuery,
  useGetPointsStatsQuery,
  useCreateProfileMutation,
} = businessService;
