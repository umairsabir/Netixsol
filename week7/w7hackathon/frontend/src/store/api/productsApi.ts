import { baseApi } from "./baseApi";
import type { Product, Category } from "@/types";

const mapProduct = (product: Record<string, unknown>): Product => {
  const categoryRaw = product.category as Record<string, unknown> | string | null | undefined;
  
  let categoryName = "General";
  let categoryId: string | undefined = undefined;
  let categoryObj: Category | undefined = undefined;

  if (typeof categoryRaw === 'object' && categoryRaw !== null) {
    categoryName = String(categoryRaw.name ?? "General");
    categoryId = String(categoryRaw._id ?? categoryRaw.id ?? "");
    categoryObj = {
      id: categoryId,
      name: categoryName,
      description: String(categoryRaw.description ?? ""),
      createdAt: String(categoryRaw.createdAt ?? ""),
      updatedAt: String(categoryRaw.updatedAt ?? ""),
    };
  } else if (typeof categoryRaw === 'string' && categoryRaw !== "") {
    categoryName = categoryRaw; // Fallback name if it's just a string name
    categoryId = categoryRaw;   // Fallback ID if it's just an ID
  }

  return {
    id: String(product.id ?? product._id ?? ""),
    name: String(product.name ?? ""),
    category: categoryName,
    categoryObj,
    categoryId,
    price: Number(product.price ?? 0),
    description: product.description ? String(product.description) : undefined,
    imageUrl: product.imageUrl ? String(product.imageUrl) : undefined,
    status: (product.isActive === false ? "inactive" : "active") as Product["status"],
    recipe: Array.isArray(product.recipe)
      ? product.recipe.map((item) => ({
          id: String((item as Record<string, unknown>).id ?? (item as Record<string, unknown>)._id ?? ""),
          rawMaterialId: String((item as Record<string, unknown>).rawMaterialId ?? ""),
          quantity: Number((item as Record<string, unknown>).quantity ?? 0),
          unit: String((item as Record<string, unknown>).unit ?? ""),
        }))
      : [],
    availableStock: Number(product.availableStock ?? 0),
    limitedBy:
      typeof product.limitedBy === "string"
        ? product.limitedBy
        : ((product.limitedBy as Record<string, unknown> | null)?.rawMaterialId as string | undefined),
  };
};

type ProductMutationPayload = {
  name?: string;
  price?: number;
  category?: string;
  status?: Product["status"];
  recipe?: Array<{ rawMaterialId: string; quantity: number }>;
};

const mapProductMutationBody = (body: ProductMutationPayload) => ({
  name: body.name,
  price: body.price,
  recipe: body.recipe,
  category: body.category,
  isActive: body.status ? body.status === "active" : undefined,
});

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Product[], { search?: string; category?: string } | undefined>({
      query: (params) => ({ url: "/products", params: params ?? undefined }),
      transformResponse: (response: Record<string, unknown>[]) => response.map(mapProduct),
      providesTags: ["Products"],
    }),
    getProductByBarcode: build.query<Product, string>({
      query: (barcode) => `/products/barcode/${barcode}`,
      providesTags: ["Products"],
    }),
    createProduct: build.mutation<Product, ProductMutationPayload>({
      query: (body) => ({ url: "/products", method: "POST", body: mapProductMutationBody(body) }),
      transformResponse: (response: Record<string, unknown>) => mapProduct(response),
      invalidatesTags: ["Products", "Dashboard"],
    }),
    updateProduct: build.mutation<Product, { id: string; body: ProductMutationPayload }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: "PATCH", body: mapProductMutationBody(body) }),
      transformResponse: (response: Record<string, unknown>) => mapProduct(response),
      invalidatesTags: ["Products", "Dashboard"],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products", "Dashboard"],
    }),
    duplicateProduct: build.mutation<Product, string>({
      query: (id) => ({ url: `/products/${id}/duplicate`, method: "POST" }),
      invalidatesTags: ["Products", "Dashboard"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useLazyGetProductByBarcodeQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useDuplicateProductMutation,
} = productsApi;
