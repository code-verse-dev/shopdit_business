import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

/**
 * Buyer-side split payments (platform fee + connected account).
 * Call only when Connect onboarding is complete for the seller business.
 */
export const paymentService = createApi({
  reducerPath: "paymentService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createSplitPaymentIntent: builder.mutation<
      any,
      { amount: number; currency?: string; businessId: string }
    >({
      query: (body) => ({
        url: "/payment/create-split-payment-intent",
        method: "POST",
        body,
      }),
      transformErrorResponse,
    }),
  }),
});

export const { useCreateSplitPaymentIntentMutation } = paymentService;
