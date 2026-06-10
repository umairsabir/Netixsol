import { baseApi } from "./baseApi";
import type { RawMaterial, StockHistoryEvent } from "@/types";

const mapMaterial = (material: Record<string, unknown>): RawMaterial => ({
  id: String(material.id ?? material._id ?? ""),
  name: String(material.name ?? ""),
  unit: String(material.unit ?? ""),
  currentStock: Number(material.currentStock ?? 0),
  minAlertLevel: Number(material.minAlertLevel ?? material.minStockAlert ?? 0),
  costPerUnit: material.costPerUnit ? Number(material.costPerUnit) : undefined,
  createdAt: material.createdAt ? String(material.createdAt) : undefined,
  updatedAt: material.updatedAt ? String(material.updatedAt) : undefined,
});

const mapHistoryEvent = (event: Record<string, unknown>): StockHistoryEvent => ({
  id: String(event.id ?? event._id ?? ""),
  timestamp: String(event.timestamp ?? event.createdAt ?? new Date().toISOString()),
  eventType:
    event.reason === "restock"
      ? "Restock"
      : event.reason === "order_deduct"
        ? "Sale"
        : "Manual",
  materialId: String(event.materialId ?? event.rawMaterialId ?? ""),
  quantityChange: Number(event.quantityChange ?? event.delta ?? 0),
  resultingStock: Number(event.resultingStock ?? event.afterStock ?? 0),
  reference: String(event.reference ?? event.orderId ?? event.note ?? ""),
});

export const rawMaterialsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRawMaterials: build.query<RawMaterial[], { search?: string; lowOnly?: boolean } | undefined>({
      query: (params) => ({ url: "/raw-materials", params: params ?? undefined }),
      transformResponse: (response: Record<string, unknown>[]) => response.map(mapMaterial),
      providesTags: ["RawMaterials"],
    }),
    createRawMaterial: build.mutation<RawMaterial, Partial<RawMaterial>>({
      query: (body) => ({
        url: "/raw-materials",
        method: "POST",
        body: {
          name: body.name,
          unit: body.unit,
          currentStock: body.currentStock ?? 0,
          minStockAlert: body.minAlertLevel ?? 0,
        },
      }),
      transformResponse: (response: Record<string, unknown>) => mapMaterial(response),
      invalidatesTags: ["RawMaterials", "Dashboard", "Products"],
    }),
    updateRawMaterial: build.mutation<RawMaterial, { id: string; body: Partial<RawMaterial> }>({
      query: ({ id, body }) => ({
        url: `/raw-materials/${id}`,
        method: "PATCH",
        body: {
          name: body.name,
          unit: body.unit,
          currentStock: body.currentStock,
          minStockAlert: body.minAlertLevel,
        },
      }),
      transformResponse: (response: Record<string, unknown>) => mapMaterial(response),
      invalidatesTags: ["RawMaterials", "Dashboard", "Products"],
    }),
    restockRawMaterial: build.mutation<RawMaterial, { id: string; quantity: number }>({
      query: ({ id, quantity }) => ({ url: `/raw-materials/${id}/restock`, method: "PATCH", body: { amount: quantity } }),
      transformResponse: (response: Record<string, unknown>) => mapMaterial(response),
      invalidatesTags: ["RawMaterials", "Dashboard", "Products"],
    }),
    bulkRestock: build.mutation<void, Array<{ id: string; quantity: number }>>({
      query: (body) => ({
        url: "/raw-materials/bulk-restock",
        method: "PATCH",
        body: { items: body.map((item) => ({ rawMaterialId: item.id, amount: item.quantity })) },
      }),
      invalidatesTags: ["RawMaterials", "Dashboard", "Products"],
    }),
    deleteRawMaterial: build.mutation<void, string>({
      query: (id) => ({ url: `/raw-materials/${id}`, method: "DELETE" }),
      invalidatesTags: ["RawMaterials", "Products", "Dashboard"],
    }),
    getRawMaterialHistory: build.query<
      { nodes: StockHistoryEvent[]; total: number; page: number; limit: number },
      { id: string; page?: number; limit?: number; startDate?: string; endDate?: string }
    >({
      query: ({ id, ...params }) => ({
        url: `/raw-materials/${id}/history`,
        params,
      }),
      transformResponse: (response: {
        nodes: Record<string, unknown>[];
        total: number;
        page: number;
        limit: number;
      }) => ({
        ...response,
        nodes: response.nodes.map(mapHistoryEvent),
      }),
      providesTags: (result, error, { id }) => [{ type: "RawMaterials", id: `HISTORY-${id}` }],
    }),
  }),
});

export const {
  useGetRawMaterialsQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useRestockRawMaterialMutation,
  useDeleteRawMaterialMutation,
  useGetRawMaterialHistoryQuery,
  useBulkRestockMutation,
} = rawMaterialsApi;
