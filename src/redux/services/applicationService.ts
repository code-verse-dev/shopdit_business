import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const applicationService = createApi({
  reducerPath: "applicationService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/application",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["JobApplications"],
  endpoints: (builder) => ({
    getJobApplications: builder.query<any, string>({
      query: (jobId) => `/getJobApplications/${jobId}`,
      providesTags: (_result, _err, jobId) => [
        { type: "JobApplications", id: jobId },
      ],
      transformErrorResponse,
    }),
  }),
});

export const { useGetJobApplicationsQuery } = applicationService;
