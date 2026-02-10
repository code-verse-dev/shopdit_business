import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const campaignManagementService = createApi({
  reducerPath: "campaignManagementService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/campaigns",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Campaigns"],
  refetchOnMountOrArgChange: true,

  endpoints: (builder) => ({
    getCampaigns: builder.query<
      any,
      { businessId: string; page: number; limit: number }
    >({
      query: ({ businessId, page, limit }) =>
        `/getCampaigns?businessId=${businessId}&page=${page}&limit=${limit}`,
      providesTags: ["Campaigns"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetCampaignsQuery } = campaignManagementService;
