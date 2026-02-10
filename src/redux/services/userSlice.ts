import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const userSlice = createApi({
  reducerPath: "userSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/business",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Profile"],
  refetchOnMountOrArgChange: true,

  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: (id: string) => `/getBusiness/${id}`,
      providesTags: ["Profile"],
      transformErrorResponse,
    }),
    editProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: `/editProfile`,
        method: "PUT",
        body: formData,
      }),
      transformErrorResponse,
      invalidatesTags: ["Profile"],
    }),
    setActiveProfile: builder.mutation<any, { profileId: string }>({
      query: (body) => ({
        url: `/setActiveProfile`,
        method: "PUT",
        body,
      }),
      transformErrorResponse,
      invalidatesTags: ["Profile"],
    }),
  }),
});

export const {
  useEditProfileMutation,
  useGetMyProfileQuery,
  useSetActiveProfileMutation,
} = userSlice;
