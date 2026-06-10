import { baseApi } from "./baseApi";
import type { AuthToken, User } from "@/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthToken & { user: User }, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    verifyToken: build.query<User, void>({
      query: () => "/auth/verify",
      providesTags: ["Auth"],
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
  }),
});

export const { useLoginMutation, useVerifyTokenQuery, useLogoutMutation } = authApi;
