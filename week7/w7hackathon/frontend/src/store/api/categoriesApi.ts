import { baseApi } from "./baseApi";

export interface Category {
  id: string;
  name: string;
  description?: string;
}

const mapCategory = (category: Record<string, unknown>): Category => ({
  id: String(category.id ?? category._id ?? ""),
  name: String(category.name ?? ""),
  description: category.description ? String(category.description) : undefined,
});

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<Category[], void>({
      query: () => "/categories",
      transformResponse: (res: Record<string, unknown>[]) => res.map(mapCategory),
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation<Category, Partial<Category>>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: build.mutation<Category, { id: string; body: Partial<Category> }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: build.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Categories"],
    }),
  })
});

export const { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } = categoriesApi;
