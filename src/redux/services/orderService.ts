import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const orderService = createApi({
  reducerPath: "orderService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/order",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Orders", "Order"],
  endpoints: (builder) => ({
    getBusinessProfileOrders: builder.query<
      any,
      { businessProfileId: string; page: number; limit: number }
    >({
      query: ({ businessProfileId, page, limit }) =>
        `/getBusinessProfileOrders?businessProfileId=${businessProfileId}&page=${page}&limit=${limit}`,
      providesTags: ["Orders"],
      transformErrorResponse,
    }),
    getOrder: builder.query<any, string>({
      query: (id) => `/getOrder/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Order", id }],
      transformErrorResponse,
    }),
  }),
});

export const { useGetBusinessProfileOrdersQuery, useGetOrderQuery } = orderService;
