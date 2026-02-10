import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const analyticsService = createApi({
  reducerPath: "analyticsService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/analytics",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    getBusinessAnalytics: builder.query<any, { businessProfileId: string }>({
      query: ({ businessProfileId }) =>
        `/?businessProfileId=${businessProfileId}`,
      providesTags: ["Analytics"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetBusinessAnalyticsQuery } = analyticsService;
