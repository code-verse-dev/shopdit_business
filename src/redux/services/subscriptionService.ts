import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const subscriptionService = createApi({
  reducerPath: "subscriptionService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["ActiveSubscription"],
  endpoints: (builder) => ({
    /** Returns active subscription or 404 when none. */
    fetchActiveSubscription: builder.query<any, void>({
      query: () => "/subscription/fetchActiveSubscription",
      providesTags: ["ActiveSubscription"],
      transformErrorResponse: (err) => {
        if (err.status !== 404) transformErrorResponse(err);
        return err;
      },
    }),
    buySubscription: builder.mutation<
      any,
      {
        planId: string;
        cycle: "monthly" | "yearly";
        cardNumber: string;
        expDate: string;
        cvv: string;
        address: string;
        zip: string;
      }
    >({
      query: (body) => ({
        url: "/subscription/buySubscription-web",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ActiveSubscription"],
      transformErrorResponse,
    }),
  }),
});

export const {
  useFetchActiveSubscriptionQuery,
  useBuySubscriptionMutation,
} = subscriptionService;
