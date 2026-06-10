"use client";

import { Button, Drawer, Stack, Table, Paper, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, Box, Divider, IconButton, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBulkRestockMutation, useGetRawMaterialHistoryQuery, useGetRawMaterialsQuery, useRestockRawMaterialMutation, useCreateRawMaterialMutation } from "@/store/api/rawMaterialsApi";
import { useSnackbar } from "@/hooks/useSnackbar";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  unit: z.string().min(1, "Unit is required"),
  minAlertLevel: z.coerce.number().min(0, "Must be non-negative"),
});

export default function RawMaterialsPage() {
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [restockQty, setRestockQty] = useState<Record<string, number>>({});
  const [historyPage, setHistoryPage] = useState(0);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { show } = useSnackbar();
  const { data = [] } = useGetRawMaterialsQuery(undefined);
  const [restockRawMaterial] = useRestockRawMaterialMutation();
  const [bulkRestock] = useBulkRestockMutation();
  const [createRawMaterial] = useCreateRawMaterialMutation();

  const { data: historyData = { nodes: [], total: 0, page: 1, limit: 10 } } = useGetRawMaterialHistoryQuery(
    {
      id: selectedHistoryId ?? "",
      page: historyPage + 1,
      limit: historyLimit,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    },
    { skip: !selectedHistoryId }
  );
  const getMaterialId = (material: { id?: string; _id?: string }) => material.id ?? material._id ?? "";
  const getHistoryEventId = (event: { id?: string; _id?: string }, index: number) =>
    event.id ?? event._id ?? `history-${index}`;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", unit: "", minAlertLevel: 0 },
  });

  return (
    <Stack spacing={2}>
      <Stack sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <Typography variant="h5">Raw Materials</Typography>
        <Stack spacing={2} direction="row">
          <Button variant="outlined" onClick={() => setOpenAdd(true)}>Add Material</Button>
          <Button variant="contained" onClick={async () => {
            const payload = Object.entries(restockQty).filter(([_, qty]) => Number(qty) > 0).map(([id, quantity]) => ({ id, quantity: Number(quantity) }));
            if (!payload.length) return;
            try {
              await bulkRestock(payload).unwrap();
              show("Bulk restock successful", "success");
              setRestockQty({});
            } catch {
              show("Failed to bulk restock", "error");
            }
          }}>Save Bulk Restock</Button>
        </Stack>
      </Stack>

      <Table>
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Unit</TableCell><TableCell>Stock</TableCell><TableCell>Min</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {data.map((m) => (
            <TableRow key={getMaterialId(m)}>
              <TableCell>{m.name}</TableCell><TableCell>{m.unit}</TableCell><TableCell>{m.currentStock}</TableCell><TableCell>{m.minAlertLevel}</TableCell>
              <TableCell>
                <Stack spacing={1} sx={{ display: "flex", flexDirection: "row" }}>
                  <TextField
                    type="number"
                    size="small"
                    sx={{ width: 100 }}
                    placeholder="Qty"
                    value={restockQty[getMaterialId(m)] || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRestockQty((prev) => ({
                        ...prev,
                        [getMaterialId(m)]: val === "" ? 0 : Number(val)
                      }));
                    }}
                  />
                  <Button size="small" onClick={async () => {
                    const qty = restockQty[getMaterialId(m)];
                    if (!qty || qty <= 0) return;
                    try {
                      await restockRawMaterial({ id: getMaterialId(m), quantity: Number(qty) }).unwrap();
                      show("Restocked successfully", "success");
                      setRestockQty(prev => {
                        const next = { ...prev };
                        delete next[getMaterialId(m)];
                        return next;
                      });
                    } catch {
                      show("Could not restock", "error");
                    }
                  }}>Restock</Button>
                  <Button size="small" onClick={() => setSelectedHistoryId(getMaterialId(m))}>History</Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Drawer
        anchor="right"
        open={Boolean(selectedHistoryId)}
        onClose={() => setSelectedHistoryId(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "100vw", sm: 700, md: 850 },
              bgcolor: "background.default",
            }
          }
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Stack
            direction="row"
            sx={{
              p: 2.5,
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Stock History</Typography>
            <IconButton onClick={() => setSelectedHistoryId(null)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Filters */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 0,
              borderRadius: 0,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "grey.50"
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <TextField
                label="From Date"
                type="date"
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setHistoryPage(0); }}
              />
              <TextField
                label="To Date"
                type="date"
                size="small"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setHistoryPage(0); }}
              />
            </Stack>
          </Paper>

          {/* Table Content */}
          <Box sx={{ flexGrow: 1, overflow: "auto", bgcolor: "background.paper" }}>
            <Table size="medium" stickyHeader sx={{ width: "100%", tableLayout: "auto" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary", width: "35%" }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>Change</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>Resulting Stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyData.nodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" color="text.secondary">
                        No transactions found for the selected period.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.nodes.map((event, index) => (
                    <TableRow key={getHistoryEventId(event, index)} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(event.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={event.eventType}
                          size="small"
                          variant="outlined"
                          color={event.eventType === "Restock" ? "success" : event.eventType === "Sale" ? "primary" : "default"}
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            color: event.quantityChange > 0 ? "success.main" : "error.main",
                            fontWeight: 700
                          }}
                        >
                          {event.quantityChange > 0 ? "+" : ""}{event.quantityChange}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {event.resultingStock}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            component="div"
            count={historyData.total}
            page={historyPage}
            onPageChange={(_, page) => setHistoryPage(page)}
            rowsPerPage={historyLimit}
            onRowsPerPageChange={(e) => {
              setHistoryLimit(parseInt(e.target.value, 10));
              setHistoryPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{ borderTop: 1, borderColor: "divider" }}
          />
        </Box>
      </Drawer>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Raw Material</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" {...form.register("name")} error={!!form.formState.errors.name} helperText={form.formState.errors.name?.message} />
            <TextField label="Unit (e.g., g, ml, pcs)" {...form.register("unit")} error={!!form.formState.errors.unit} helperText={form.formState.errors.unit?.message} />
            <TextField label="Minimum Alert Level" type="number" {...form.register("minAlertLevel")} error={!!form.formState.errors.minAlertLevel} helperText={form.formState.errors.minAlertLevel?.message} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={form.handleSubmit(async (values) => {
            try {
              await createRawMaterial(values).unwrap();
              show("Raw material created successfully!", "success");
              setOpenAdd(false);
              form.reset();
            } catch {
              show("Could not create raw material.", "error");
            }
          })}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
