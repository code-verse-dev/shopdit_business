import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const customerService = createApi({
  reducerPath: "customerService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/businessProfile",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["BusinessCustomers"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getBusinessCustomers: builder.query<
      any,
      { businessProfileId: string; page: number; limit: number }
    >({
      query: ({ businessProfileId, page, limit }) =>
        `/getBusinessCustomers?businessProfileId=${businessProfileId}&page=${page}&limit=${limit}`,
      providesTags: ["BusinessCustomers"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetBusinessCustomersQuery } = customerService;
