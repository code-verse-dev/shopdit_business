import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const jobService = createApi({
  reducerPath: "jobService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/jobs",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Jobs", "Job"],
  endpoints: (builder) => ({
    getJobsByBusiness: builder.query<any, { businessId: string }>({
      query: ({ businessId }) => `/jobsByBusiness?businessId=${businessId}`,
      providesTags: ["Jobs"],
      transformErrorResponse,
    }),
    getJob: builder.query<any, string>({
      query: (id) => `/getJob/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Job", id }],
      transformErrorResponse,
    }),
  }),
});

export const { useGetJobsByBusinessQuery, useGetJobQuery } = jobService;
