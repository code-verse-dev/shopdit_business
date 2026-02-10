import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const productService = createApi({
  reducerPath: "productService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/product",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["BusinessProducts"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getBusinessProducts: builder.query<
      any,
      { businessProfileId: string; page: number; limit: number }
    >({
      query: ({ businessProfileId, page, limit }) =>
        `/getBusinessProducts?businessProfileId=${businessProfileId}&page=${page}&limit=${limit}`,
      providesTags: ["BusinessProducts"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetBusinessProductsQuery } = productService;
