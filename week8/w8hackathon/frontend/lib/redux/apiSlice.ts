import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' }),
  tagTypes: ['Document'],
  endpoints: (builder) => ({
    getDocuments: builder.query<any[], void>({
      query: () => '/documents',
      providesTags: ['Document'],
    }),
    getDocumentById: builder.query<any, string>({
      query: (id) => `/documents/${id}`,
      providesTags: (result, error, id) => [{ type: 'Document', id }],
    }),
    uploadDocument: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/documents/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Document'],
    }),
    chatWithDocument: builder.mutation<any, { id: string; message: string }>({
      query: ({ id, message }) => ({
        url: `/documents/${id}/chat`,
        method: 'POST',
        body: { message },
      }),
    }),
    deleteDocument: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
  }),
});

export const {
  useGetDocumentsQuery,
  useGetDocumentByIdQuery,
  useUploadDocumentMutation,
  useChatWithDocumentMutation,
  useDeleteDocumentMutation,
} = apiSlice;
