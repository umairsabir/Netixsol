import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Room {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Message {
  id: string;
  roomId: string;
  username: string;
  text: string;
  timestamp: string;
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api" 
  }),
  endpoints: (builder) => ({
    getRooms: builder.query<Room[], void>({
      query: () => "/rooms",
    }),
    getMessages: builder.query<Message[], string>({
      query: (roomId) => `/messages/${roomId}`,
    }),
    sendMessage: builder.mutation<void, Message>({
      query: (msg) => ({
        url: `/messages/${msg.roomId}`,
        method: "POST",
        body: msg,
      }),
    }),
  }),
});

export const { useGetRoomsQuery, useGetMessagesQuery, useSendMessageMutation } = chatApi;
