import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const couponService = createApi({
  reducerPath: "couponService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/coupon",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Coupons"],
  endpoints: (builder) => ({
    getBusinessCoupons: builder.query<any, { businessProfileId: string }>({
      query: ({ businessProfileId }) =>
        `/getBusinessCoupons?businessProfileId=${businessProfileId}`,
      providesTags: ["Coupons"],
      transformErrorResponse,
    }),
    addCoupon: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/addCoupon",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Coupons"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetBusinessCouponsQuery, useAddCouponMutation } = couponService;
