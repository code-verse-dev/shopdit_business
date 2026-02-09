import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../constants/api";
import { transformErrorResponse } from "./authSlice";

export const eventService = createApi({
  reducerPath: "eventService",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/event",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Events"],
  endpoints: (builder) => ({
    getBusinessEvents: builder.query<
      any,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, page = 1, limit = 10 }) =>
        `/getBusinessEvents/${id}?page=${page}&limit=${limit}`,
      providesTags: ["Events"],
      transformErrorResponse,
    }),
  }),
});

export const { useGetBusinessEventsQuery } = eventService;
