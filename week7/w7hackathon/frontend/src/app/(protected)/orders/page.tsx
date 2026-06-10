"use client";

import { 
  Button, 
  Drawer, 
  Stack, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  TextField, 
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  TablePagination,
  TableContainer
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useGetOrdersQuery, useLazyExportOrdersQuery, useVoidOrderMutation } from "@/store/api/ordersApi";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Order, OrderLineItem } from "@/types";

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [voidId, setVoidId] = useState<string | null>(null);
  
  const { data, isLoading } = useGetOrdersQuery({ 
    search, 
    page: page + 1, 
    limit: rowsPerPage,
    startDate,
    endDate
  }) as { data: { nodes: Order[]; total: number; page: number; limit: number } | undefined, isLoading: boolean };
  
  const [voidOrder] = useVoidOrderMutation();
  const [exportOrders, { isFetching: isExporting }] = useLazyExportOrdersQuery();
  
  const getOrderId = (order: { id?: string; _id?: string }) => order.id ?? order._id ?? "";
  
  const selectedOrder = useMemo(
    () => data?.nodes.find((x) => getOrderId(x) === selectedOrderId),
    [data?.nodes, selectedOrderId],
  );

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ alignItems: "center" }}>
          <TextField 
            label="Search Orders"
            placeholder="Order ID..." 
            size="small"
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            label="From Date"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
          />
          <TextField
            label="To Date"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
          />
          <Button 
            variant="contained" 
            disabled={isExporting} 
            onClick={async () => {
              const blob = await exportOrders({ startDate, endDate }).unwrap();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `orders_${format(new Date(), "yyyy-MM-dd")}.csv`;
              a.click();
            }}
          >
            Export CSV
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>Loading orders...</TableCell></TableRow>
            ) : !data || data.nodes.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No orders found.</TableCell></TableRow>
            ) : (
              data.nodes.map((o) => (
                <TableRow key={getOrderId(o)} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{o.orderNumber}</TableCell>
                  <TableCell>{format(new Date(o.timestamp), "PPpp")}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>${Number(o.total ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={o.status} 
                      size="small" 
                      color={o.status === "completed" ? "success" : "error"} 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <Button size="small" variant="outlined" onClick={() => setSelectedOrderId(getOrderId(o))}>View</Button>
                      {o.status !== "voided" && (
                        <Button size="small" variant="outlined" color="error" onClick={() => setVoidId(getOrderId(o))}>
                          Void
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data?.total ?? 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      <Drawer 
        anchor="right" 
        open={Boolean(selectedOrderId)} 
        onClose={() => setSelectedOrderId(null)}
        slotProps={{ paper: { sx: { width: { xs: "100vw", sm: 500, md: 650 } } } }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" sx={{ p: 2, alignItems: "center", justifyContent: "space-between", borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Order Details</Typography>
            <IconButton onClick={() => setSelectedOrderId(null)}><CloseIcon /></IconButton>
          </Stack>

          {selectedOrder && (
            <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Order Number</Typography>
                  <Typography variant="h6">{selectedOrder.orderNumber}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography variant="body1">{format(new Date(selectedOrder.timestamp), "PPpp")}</Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: "1.1rem" }}>Items</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item: OrderLineItem) => (
                        <TableRow key={item.id ?? item.productId}>
                          <TableCell>{item.productName || "Product deleted"}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>${item.lineTotal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} sx={{ borderBottom: "none", pt: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Grand Total</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: "none", pt: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            ${Number(selectedOrder.total ?? 0).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>

                <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                   <Typography variant="subtitle2" color="text.secondary">Order Status</Typography>
                   <Chip 
                    label={selectedOrder.status} 
                    color={selectedOrder.status === "completed" ? "success" : "error"} 
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                </Box>
              </Stack>
            </Box>
          )}
        </Box>
      </Drawer>

      <ConfirmDialog 
        open={Boolean(voidId)} 
        title="Void order" 
        message="Voiding an order restores material stock and cannot be undone. Continue?" 
        confirmLabel="Void Order" 
        isDestructive 
        onClose={() => setVoidId(null)} 
        onConfirm={async () => {
          if (!voidId) return;
          await voidOrder(voidId).unwrap();
          setVoidId(null);
        }} 
      />
    </Stack>
  );
}
