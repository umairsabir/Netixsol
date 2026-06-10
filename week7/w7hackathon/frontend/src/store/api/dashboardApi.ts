import { baseApi } from "./baseApi";
import type { DashboardSummary } from "@/types";

const mapDashboardSummary = (response: Record<string, unknown>): DashboardSummary => ({
  totalSalesToday: Number(response.totalSalesToday ?? 0),
  ordersToday: Number(response.ordersToday ?? 0),
  totalProducts: Number(response.totalProducts ?? 0),
  lowStockAlertCount: Number(response.lowStockAlertCount ?? 0),
  productsAtRisk: [], // Simplified for now
  chartData: Array.isArray(response.chartData)
    ? (response.chartData as Array<{ date: string; revenue: number; orders?: number }>)
    : [],
  topProducts: Array.isArray(response.topProducts)
    ? (response.topProducts as Array<{ name: string; units: number }>)
    : [],
  inventoryStatus: [], // Simplified for now
});

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardSummary: build.query<DashboardSummary, { range?: string; startDate?: string; endDate?: string } | undefined>({
      query: (params) => ({ url: "/dashboard/summary", params: params ?? undefined }),
      transformResponse: (response: Record<string, unknown>) => mapDashboardSummary(response),
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
