import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL, hasApiBaseUrl } from "@/lib/apiClient";
import { clearToken, getToken } from "@/lib/auth";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
    headers.set("content-type", "application/json");
    return headers;
  },
});

const baseQueryWithRefresh: typeof rawBaseQuery = async (args, api, extraOptions) => {
  if (!hasApiBaseUrl) {
    return {
      error: {
        status: 500,
        data: { message: "NEXT_PUBLIC_API_BASE_URL is required. Mock mode is disabled." },
      },
    };
  }

  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    clearToken();
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRefresh,
  tagTypes: ["Auth", "Dashboard", "Products", "RawMaterials", "Orders", "Settings", "Users", "Categories"],
  endpoints: () => ({}),
});
