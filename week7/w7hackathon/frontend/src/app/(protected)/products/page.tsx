"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, MenuItem, Box, Divider, alpha, LinearProgress, Skeleton } from "@mui/material";
import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { useCreateProductMutation, useDeleteProductMutation, useGetProductsQuery, useUpdateProductMutation } from "@/store/api/productsApi";
import { useGetRawMaterialsQuery } from "@/store/api/rawMaterialsApi";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useSnackbar } from "@/hooks/useSnackbar";
import type { Product } from "@/types";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";

const schema = z.object({
  name: z.string().min(2, "Required"),
  category: z.string().optional(),
  price: z.coerce.number().gt(0, "Must be > 0"),
  recipe: z.array(z.object({
    rawMaterialId: z.string().min(1, "Required"),
    quantity: z.coerce.number().gt(0, "Must be > 0")
  })).min(1, "At least one ingredient is required")
});

type FormValues = z.infer<typeof schema>;

export default function ProductsPage() {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { data = [], isFetching, isLoading } = useGetProductsQuery({ search, category: category || undefined });
  const { data: materials = [] } = useGetRawMaterialsQuery(undefined);
  const { data: categories = [] } = useGetCategoriesQuery();
  const { show } = useSnackbar();

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: "", price: 0, recipe: [] as { rawMaterialId: string; quantity: number }[] }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "recipe"
  });

  // Handle Dialog Actions
  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          name: editItem.name,
          category: editItem.categoryId || "",
          price: editItem.price,
          recipe: editItem.recipe.map(r => ({
            rawMaterialId: r.rawMaterialId,
            quantity: r.quantity
          }))
        });
      } else {
        form.reset({ name: "", category: "", price: 0, recipe: [] });
      }
    }
  }, [open, editItem, form]);

  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
  };

  const getProductId = (product: { id?: string; _id?: string }) => product.id ?? product._id ?? "";

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5">Products Inventory</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Add New Product</Button>
      </Stack>

      <Box sx={{ position: "relative", p: 2, bgcolor: "background.paper", borderRadius: "16px", border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`, overflow: "hidden" }}>
        {isFetching && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: isFetching ? 0.5 : 0 }}>
          <TextField
            fullWidth
            placeholder="Search product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          />
          <TextField
            select
            fullWidth
            label="Filter by Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sx={{ minWidth: { sm: 240 }, "& .MuiOutlinedInput-root": { borderRadius: "10px" } }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          {(search || category) && (
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              startIcon={<FilterListOffIcon />}
              onClick={handleClearFilters}
              sx={{ borderRadius: "10px", height: "56px", whiteSpace: "nowrap", flexShrink: 0, width: { sm: "auto" } }}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Box>

      <Table>
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell>Price</TableCell><TableCell>Available Units</TableCell>
          {/* <TableCell>Status</TableCell> */}
          <TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}><Skeleton variant="text" width="80%" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  No products found matching your search.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((p) => (
              <TableRow key={getProductId(p)}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category || "General"}</TableCell>
                <TableCell>${p.price.toFixed(2)}</TableCell>
                <TableCell>{p.availableStock}</TableCell>
                {/* <TableCell><Switch checked={p.status === "active"} readOnly /></TableCell> */}
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => { setEditItem(p); setOpen(true); }}>Edit</Button>
                    <Button size="small" color="error" onClick={() => setDeleteId(getProductId(p))}>Delete</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editItem ? "Edit Product" : "New Product"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" {...form.register("name")} error={!!form.formState.errors.name} helperText={form.formState.errors.name?.message} />

            <Controller
              name="category"
              control={form.control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  select
                  label="Category (Optional)"
                  fullWidth
                  value={value || ""}
                  onChange={onChange}
                  error={!!form.formState.errors.category}
                  helperText={form.formState.errors.category?.message}
                >
                  <MenuItem value=""><em>None / General</em></MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <TextField label="Price" type="number" {...form.register("price")} error={!!form.formState.errors.price} helperText={form.formState.errors.price?.message} />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Recipe Ingredients</Typography>
            {form.formState.errors.recipe?.root && (
              <Typography color="error" variant="body2">{form.formState.errors.recipe.root.message}</Typography>
            )}

            {fields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Controller
                  name={`recipe.${index}.rawMaterialId`}
                  control={form.control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      select
                      label="Raw Material"
                      fullWidth
                      value={value}
                      onChange={onChange}
                      error={!!form.formState.errors.recipe?.[index]?.rawMaterialId}
                      helperText={form.formState.errors.recipe?.[index]?.rawMaterialId?.message}
                    >
                      {materials.map((m) => (
                        <MenuItem key={m.id} value={m.id}>{m.name} ({m.unit})</MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name={`recipe.${index}.quantity`}
                  control={form.control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      label="Quantity"
                      type="number"
                      value={value}
                      onChange={onChange}
                      error={!!form.formState.errors.recipe?.[index]?.quantity}
                      helperText={form.formState.errors.recipe?.[index]?.quantity?.message}
                      sx={{ width: 120 }}
                    />
                  )}
                />

                <Button color="error" onClick={() => remove(index)}>Remove</Button>
              </Stack>
            ))}

            <Button variant="outlined" onClick={() => append({ rawMaterialId: "", quantity: 0 })}>
              Add Ingredient
            </Button>

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" disabled={isCreating || isUpdating || !materials.length} onClick={form.handleSubmit(async (values) => {
            if (!materials.length) {
              show("Add at least one raw material before creating products.", "error");
              return;
            }
            try {
              const payload = {
                name: values.name,
                category: values.category || undefined,
                price: values.price,
                status: editItem?.status || "active",
                recipe: values.recipe.map(r => ({
                  rawMaterialId: r.rawMaterialId,
                  quantity: r.quantity
                })),
              };

              if (editItem) {
                await updateProduct({ id: getProductId(editItem), body: payload }).unwrap();
                show("Product updated successfully!", "success");
              } else {
                await createProduct(payload).unwrap();
                show("Product created perfectly!", "success");
              }
              handleClose();
            } catch (err) {
              show(`Could not ${editItem ? "update" : "create"} product`, "error");
            }
          })}>
            Save
          </Button>
        </DialogActions>
      </Dialog>


      <ConfirmDialog open={Boolean(deleteId)} title="Delete product" message="Delete this product?" isDestructive confirmLabel="Delete" onClose={() => setDeleteId(null)} onConfirm={async () => {
        if (!deleteId) return;
        await deleteProduct(deleteId).unwrap();
        setDeleteId(null);
      }} />
    </Stack>
  );
}
