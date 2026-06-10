import { baseApi } from "./baseApi";
import type { AppConfig, User } from "@/types";

const mapConfig = (response: Record<string, unknown>): AppConfig => ({
  businessName: String(response.businessName ?? response.storeName ?? "My POS"),
  currencySymbol: String(response.currencySymbol ?? response.currency ?? "$"),
  taxRate: Number(response.taxRate ?? response.taxPercent ?? 0),
  emailAlerts: Boolean(response.emailAlerts ?? false),
  alertEmail: String(response.alertEmail ?? ""),
});

const mapUser = (response: Record<string, unknown>): User => ({
  id: String(response.id ?? response._id ?? ""),
  email: String(response.email ?? ""),
  name: String(response.name ?? ""),
  role: (response.role === "admin" ? "admin" : "cashier") as "admin" | "cashier",
  status: (response.isActive === false ? "inactive" : "active") as User["status"],
  createdAt: response.createdAt ? String(response.createdAt) : undefined,
});

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConfig: build.query<AppConfig, void>({
      query: () => "/settings",
      transformResponse: (response: Record<string, unknown>) => mapConfig(response),
      providesTags: ["Settings"],
    }),
    updateGeneral: build.mutation<AppConfig, Partial<AppConfig>>({
      query: (body) => ({
        url: "/settings",
        method: "PATCH",
        body: {
          storeName: body.businessName,
          currency: body.currencySymbol,
          taxPercent: body.taxRate,
        },
      }),
      transformResponse: (response: Record<string, unknown>) => mapConfig(response),
      invalidatesTags: ["Settings", "Dashboard"],
    }),
    updateNotifications: build.mutation<AppConfig, Pick<AppConfig, "emailAlerts" | "alertEmail">>({
      query: () => ({ url: "/settings", method: "PATCH", body: {} }),
      invalidatesTags: ["Settings", "Dashboard"],
    }),
    changePassword: build.mutation<void, { currentPassword: string; newPassword: string }>({
      queryFn: async () => ({ error: { status: 501, data: { message: "Change password endpoint is not implemented yet." } } }),
    }),
    getUsers: build.query<User[], void>({
      query: () => "/users",
      transformResponse: (response: Record<string, unknown>[]) => response.map(mapUser),
      providesTags: ["Users"],
    }),
    inviteUser: build.mutation<User, { name: string; email: string; role: "admin" | "cashier" }>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body: { ...body, password: "ChangeMe123!" },
      }),
      transformResponse: (response: Record<string, unknown>) => mapUser(response),
      invalidatesTags: ["Users"],
    }),
    updateUser: build.mutation<User, { id: string; body: Partial<User> }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: { isActive: body.status !== "inactive", role: body.role },
      }),
      transformResponse: (response: Record<string, unknown>) => mapUser(response),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetConfigQuery,
  useUpdateGeneralMutation,
  useUpdateNotificationsMutation,
  useChangePasswordMutation,
  useGetUsersQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
} = settingsApi;
