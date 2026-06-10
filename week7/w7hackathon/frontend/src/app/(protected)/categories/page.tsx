"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation, Category } from "@/store/api/categoriesApi";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useSnackbar } from "@/hooks/useSnackbar";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CategoriesPage() {
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data = [] } = useGetCategoriesQuery();
  const { show } = useSnackbar();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  
  const form = useForm({ 
    resolver: zodResolver(schema), 
    defaultValues: { name: "", description: "" } 
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          name: editItem.name,
          description: editItem.description || ""
        });
      } else {
        form.reset({ name: "", description: "" });
      }
    }
  }, [open, editItem, form]);

  const handleClose = () => {
    setOpen(false);
    setEditItem(null);
  };

  return (
    <Stack spacing={2}>
      <Stack sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <Typography variant="h5">Categories</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Add Category</Button>
      </Stack>
      
      <Table>
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Description</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {data.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.description || "-"}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={() => { setEditItem(c); setOpen(true); }}>Edit</Button>
                  <Button size="small" color="error" onClick={() => setDeleteId(c.id)}>Delete</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editItem ? "Edit Category" : "New Category"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" {...form.register("name")} error={!!form.formState.errors.name} helperText={form.formState.errors.name?.message} />
            <TextField label="Description" {...form.register("description")} error={!!form.formState.errors.description} helperText={form.formState.errors.description?.message} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" disabled={isCreating || isUpdating} onClick={form.handleSubmit(async (values) => {
            try {
              if (editItem) {
                await updateCategory({ id: editItem.id, body: values }).unwrap();
                show("Category updated", "success");
              } else {
                await createCategory(values).unwrap();
                show("Category created", "success");
              }
              handleClose();
            } catch (err) {
              show(`Could not ${editItem ? "update" : "create"} category`, "error");
            }
          })}>
            Save
          </Button>
        </DialogActions>
      </Dialog>


      <ConfirmDialog open={Boolean(deleteId)} title="Delete category" message="Are you sure you want to delete this category?" isDestructive confirmLabel="Delete" onClose={() => setDeleteId(null)} onConfirm={async () => {
        if (!deleteId) return;
        await deleteCategory(deleteId).unwrap();
        setDeleteId(null);
      }} />
    </Stack>
  );
}
