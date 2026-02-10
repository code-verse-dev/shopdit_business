import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const businessTypeService = createApi({
  reducerPath: "businessTypeService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["BusinessTypes"],
  endpoints: (builder) => ({
    getBusinessTypes: builder.query<any, void>({
      query: () => "/businessType/getBusinessTypes",
      providesTags: ["BusinessTypes"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetBusinessTypesQuery } = businessTypeService;
