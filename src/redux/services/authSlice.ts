import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ErrorPopup } from "../../components/popup/Popup";
import { BASE_URL } from "../../constants/api";

export const transformErrorResponse = (error: any) =>
  ErrorPopup(error?.data?.message);

interface LoginBody {
  email: string;
  password: string;
}

/** Used for password reset flows in this app (business dashboard). */
export const RESET_ACCOUNT_TYPE = "BUSINESS";

interface SendVerificationCodeBody {
  email: string;
  type: string;
}

interface VerifyRecoverCodeBody {
  email: string;
  code: string;
}

interface ResetPasswordBody {
  email: string;
  code: string;
  password: string;
  type: string;
}

const authServiceInstance = createApi({
  reducerPath: "authService",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL, credentials: "include" }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body: LoginBody) => ({
        url: "/business/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response.data,
    }),

    signup: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/business/signup",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: any) => response?.data ?? response,
    }),

    sendVerificationCode: builder.mutation<unknown, SendVerificationCodeBody>(
      {
        query: (body) => ({
          url: "/reset/sendVerificationCode",
          method: "POST",
          body,
        }),
        transformResponse: (response: any) => response?.data ?? response,
      }
    ),

    verifyRecoverCode: builder.mutation<unknown, VerifyRecoverCodeBody>({
      query: (body) => ({
        url: "/reset/verifyRecoverCode",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
    }),

    resetPassword: builder.mutation<unknown, ResetPasswordBody>({
      query: (body) => ({
        url: "/reset/resetPassword",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response?.data ?? response,
    }),
  }),
});

/** Business auth API (login, signup). */
export const authService: typeof authServiceInstance = authServiceInstance;

export const {
  useLoginMutation,
  useSignupMutation,
  useSendVerificationCodeMutation,
  useVerifyRecoverCodeMutation,
  useResetPasswordMutation,
} = authService;
