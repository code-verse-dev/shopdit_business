import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { ErrorPopup, SuccessPopup } from "../../components/popup/Popup";

// Common error handler
const transformErrorResponse = (error: any) => {
  ErrorPopup(error?.data?.message || "Something went wrong");
};

export const passwordResetService = createApi({
  reducerPath: "passwordResetService",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: "include" }),
  tagTypes: ["PasswordReset"],

  endpoints: (builder) => ({
    sendResetCode: builder.mutation({
      query: (body: { email: string; type: string }) => ({
        url: `/reset/sendVerificationCode`,
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        SuccessPopup(response.message || "Verification code sent!");
        return response.data;
      },
      transformErrorResponse,
    }),

    verifyResetCode: builder.mutation({
      query: (body: { email: string; code: string }) => ({
        url: `/reset/verifyRecoverCode`,
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        SuccessPopup(response.message || "Code verified successfully!");
        return response;
      },
      transformErrorResponse,
    }),

    resetPassword: builder.mutation({
      query: (body: {
        email: string;
        code: string;
        password: string;
        type: string;
      }) => ({
        url: `/reset/resetPassword`,
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        SuccessPopup(response.message || "Password reset successfully!");
        return response;
      },
      transformErrorResponse,
    }),

    changePassword: builder.mutation({
      query: (body: {
        email: string;
        oldPassword: string;
        password: string;
        type: string;
      }) => ({
        url: `/reset/changePassword`,
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        SuccessPopup(response.message || "Password changed successfully!");
        return response.data;
      },
      transformErrorResponse,
    }),
  }),
});

export const {
  useSendResetCodeMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = passwordResetService;
