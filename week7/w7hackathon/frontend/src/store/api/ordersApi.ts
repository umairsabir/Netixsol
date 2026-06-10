import { baseApi } from "./baseApi";
import type { Order } from "@/types";

const mapOrder = (order: Record<string, unknown>): Order => {
  const id = String(order.id ?? order._id ?? "");
  const timestamp = String(order.timestamp ?? order.createdAt ?? new Date().toISOString());
  return {
    id,
    orderNumber: String(order.orderNumber ?? id.slice(-6).toUpperCase()),
    timestamp,
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          id: String((item as Record<string, unknown>).id ?? (item as Record<string, unknown>)._id ?? ""),
          productId: String((item as Record<string, unknown>).productId ?? ""),
          productName: String((item as Record<string, unknown>).productName ?? ""),
          quantity: Number((item as Record<string, unknown>).quantity ?? 0),
          unitPrice: Number((item as Record<string, unknown>).unitPrice ?? 0),
          lineTotal: Number((item as Record<string, unknown>).lineTotal ?? 0),
        }))
      : [],
    subtotal: Number(order.subtotal ?? 0),
    tax: Number(order.tax ?? 0),
    discount: Number(order.discount ?? 0),
    total: Number(order.total ?? 0),
    paymentMethod: (order.paymentMethod === "card" ? "card" : "cash") as "cash" | "card",
    changeGiven: order.changeGiven ? Number(order.changeGiven) : undefined,
    customerName: order.customerName ? String(order.customerName) : undefined,
    processedBy: order.processedBy ? String(order.processedBy) : undefined,
    status: String(order.status ?? "active") as Order["status"],
  };
};

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<
      { nodes: Order[]; total: number; page: number; limit: number },
      { page?: number; limit?: number; startDate?: string; endDate?: string; search?: string } | undefined
    >({
      query: (params) => ({ url: "/orders", params: params ?? undefined }),
      transformResponse: (response: { nodes: Record<string, unknown>[]; total: number; page: number; limit: number }) => ({
        ...response,
        nodes: response.nodes.map(mapOrder),
      }),
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation<Order, { items: Array<{ productId: string; quantity: number }> }>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      transformResponse: (response: Record<string, unknown>) => mapOrder(response),
      invalidatesTags: ["Orders", "Products", "RawMaterials", "Dashboard"],
    }),
    voidOrder: build.mutation<void, string>({
      query: (id) => ({ url: `/orders/${id}/void`, method: "PATCH" }),
      invalidatesTags: ["Orders", "RawMaterials", "Dashboard"],
    }),
    exportOrders: build.query<Blob, { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: "/orders/export",
        params,
        responseHandler: async (response) => response.blob(),
      }),
    }),
  }),
});

export const { useGetOrdersQuery, useCreateOrderMutation, useVoidOrderMutation, useLazyExportOrdersQuery } = ordersApi;
