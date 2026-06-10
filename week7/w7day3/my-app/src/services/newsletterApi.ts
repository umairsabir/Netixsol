import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const newsletterApi = createApi({
  reducerPath: 'newsletterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/newsletter`,
    credentials: 'include',
  }),
  endpoints: (builder) => ({
    subscribe: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (body) => ({
        url: '/subscribe',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSubscribeMutation } = newsletterApi;
