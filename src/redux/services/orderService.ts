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
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    getAllOrders: builder.query<any, { page: number; limit: number }>({
      query: ({ page, limit }) => `/getAllOrders?page=${page}&limit=${limit}`,
      providesTags: ["Orders"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetAllOrdersQuery } = orderService;
