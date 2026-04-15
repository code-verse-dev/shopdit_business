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
    fetchPaymentConfig: builder.query<any, void>({
      query: () => "/payment/config",
      transformErrorResponse,
    }),
    /** Returns active subscription or 404 when none. */
    fetchActiveSubscription: builder.query<any, void>({
      query: () => "/subscription/fetchActiveSubscription",
      providesTags: ["ActiveSubscription"],
      transformErrorResponse: (err) => {
        if (err.status !== 404) transformErrorResponse(err);
        return err;
      },
    }),
    createSubscriptionPaymentIntent: builder.mutation<
      any,
      {
        planId: string;
        cycle: "monthly" | "yearly";
        currency?: string;
      }
    >({
      query: (body) => ({
        url: "/subscription/create-subscription-payment-intent",
        method: "POST",
        body,
      }),
      transformErrorResponse,
    }),
    saveSubscriptionPaymentStripe: builder.mutation<
      any,
      {
        paymentIntentId: string;
      }
    >({
      query: (body) => ({
        url: "/subscription/save-subscription-payment-stripe",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ActiveSubscription"],
      transformErrorResponse,
    }),
    createConnectOnboardingLink: builder.mutation<
      any,
      {
        refreshUrl: string;
        returnUrl: string;
      }
    >({
      query: (body) => ({
        url: "/subscription/create-connect-onboarding-link",
        method: "POST",
        body,
      }),
      transformErrorResponse,
    }),
    fetchConnectAccountStatus: builder.query<any, void>({
      query: () => "/subscription/connect-account-status",
      transformErrorResponse,
    }),
  }),
});

export const {
  useFetchPaymentConfigQuery,
  useFetchActiveSubscriptionQuery,
  useLazyFetchActiveSubscriptionQuery,
  useCreateSubscriptionPaymentIntentMutation,
  useSaveSubscriptionPaymentStripeMutation,
  useCreateConnectOnboardingLinkMutation,
  useFetchConnectAccountStatusQuery,
  useLazyFetchConnectAccountStatusQuery,
} = subscriptionService;
