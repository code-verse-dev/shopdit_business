import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const planService = createApi({
  reducerPath: "planService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Plans"],
  endpoints: (builder) => ({
    getPlans: builder.query<any, void>({
      query: () => "/plan/getPlans",
      providesTags: ["Plans"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetPlansQuery } = planService;
