import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ['Cart'],
  endpoints: (builder) => ({
    getProducts: builder.query<any[], string | void>({
      query: (category) => {
        let url = 'products';
        if (category && category !== 'ALL') {
          url += `?category=${category}`;
        }
        return url;
      },
    }),

    getCart: builder.query<any, string>({
      query: (sessionId) => `cart/${sessionId}`,
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation<any, { sessionId: string; item: any }>({
      query: ({ sessionId, item }) => ({
        url: `cart/${sessionId}/items`,
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation<any, { sessionId: string; productId: string; quantity: number }>({
      query: ({ sessionId, productId, quantity }) => ({
        url: `cart/${sessionId}/items/${productId}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation<any, { sessionId: string; productId: string }>({
      query: ({ sessionId, productId }) => ({
        url: `cart/${sessionId}/items/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
} = apiSlice;
