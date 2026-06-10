import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/auth`,
    credentials: 'include', // include HttpOnly cookies
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getMe: builder.query<
      { id: string; email: string; name: string },
      void
    >({
      query: () => '/me',
      providesTags: ['User'],
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetMeQuery, useLogoutMutation } = authApi;
