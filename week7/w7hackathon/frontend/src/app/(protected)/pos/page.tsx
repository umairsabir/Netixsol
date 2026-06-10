"use client";

import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack, TextField, Typography, alpha, Paper, IconButton, MenuItem, LinearProgress, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlined from "@mui/icons-material/AddCircleOutlined";
import RemoveCircleOutlined from "@mui/icons-material/RemoveCircleOutlined";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import { useMemo, useState } from "react";
import { useCreateOrderMutation } from "@/store/api/ordersApi";
import { useGetProductsQuery } from "@/store/api/productsApi";
import { addToCart, clearCart, holdOrder, restoreHeldOrder, updateQuantity } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useGetCategoriesQuery } from "@/store/api/categoriesApi";

export default function PosPage() {
  const dispatch = useAppDispatch();
  const { show } = useSnackbar();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [openCheckout, setOpenCheckout] = useState(false);
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();
  const { data: products = [], isFetching, isLoading } = useGetProductsQuery({ search, category: category || undefined });
  const { data: categories = [] } = useGetCategoriesQuery();
  const cart = useAppSelector((state) => state.cart);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
  };

  const subtotal = useMemo(() => cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart.items]);
  const getProductId = (product: { id?: string; _id?: string }) => product.id ?? product._id ?? "";

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack spacing={3}>
          <Box sx={{ position: "relative", overflow: "hidden", borderRadius: "12px", border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            {isFetching && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }} />}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ p: 1, pt: isFetching ? 1.5 : 1, bgcolor: "background.paper" }}>
              <TextField 
                fullWidth 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search products..." 
                variant="outlined"
                slotProps={{
                  input: {
                    sx: { borderRadius: "12px", bgcolor: "background.paper" }
                  }
                }}
              />
              <TextField
                select
                fullWidth
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
                sx={{ minWidth: { sm: 200 }, "& .MuiOutlinedInput-root": { borderRadius: "12px", bgcolor: "background.paper" } }}
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
                  sx={{ borderRadius: "12px", height: "56px", whiteSpace: "nowrap", flexShrink: 0, width: { sm: "auto" } }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Box>
          <Grid container spacing={2}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent>
                      <Skeleton variant="text" width="60%" height={32} />
                      <Skeleton variant="text" width="40%" height={48} sx={{ my: 1 }} />
                      <Skeleton variant="rectangular" height={32} width="100%" sx={{ borderRadius: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : products.length === 0 ? (
              <Grid size={12}>
                <Paper sx={{ p: 8, textAlign: "center", bgcolor: "background.paper", borderRadius: "16px" }}>
                  <Typography variant="h6" color="text.secondary">
                    No products found matching your search.
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              products.map((product) => (
                <Grid key={getProductId(product)} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 20px -10px rgba(0,0,0,0.15)" }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>{product.name}</Typography>
                      <Typography color="primary" variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Chip 
                          label={product.availableStock > 0 ? `${product.availableStock} in stock` : "Out of stock"} 
                          color={product.availableStock > 0 ? "success" : "error"} 
                          size="small" 
                          variant="outlined"
                        />
                        <Button 
                          size="small" 
                          disabled={product.availableStock === 0}
                          startIcon={<AddIcon />} 
                          onClick={() => dispatch(addToCart(product))}
                        >
                          Add
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ 
          p: 0, 
          position: "sticky", 
          top: 24, 
          borderRadius: "16px",
          overflow: "hidden",
          border: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Box sx={{ p: 2, bgcolor: theme => alpha(theme.palette.primary.main, 0.05), borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ShoppingCartIcon color="primary" />
                <Typography variant="h6">Current Order</Typography>
              </Stack>
              <Chip 
                label={`${cart.heldOrders.length} Held`} 
                size="small" 
                color="secondary" 
                variant={cart.heldOrders.length > 0 ? "filled" : "outlined"}
                onClick={() => cart.heldOrders[0] && dispatch(restoreHeldOrder(cart.heldOrders[0].id))} 
                sx={{ cursor: "pointer" }}
              />
            </Stack>
          </Box>
          
          <Box sx={{ p: 2, maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
            <Stack spacing={2}>
              {cart.items.map((item) => (
                <Box key={item.productId} sx={{ pb: 2, borderBottom: theme => `1px solid ${alpha(theme.palette.divider, 0.05)}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <IconButton size="small" onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}>
                        <RemoveCircleOutlined fontSize="small" />
                      </IconButton>
                      <Typography variant="body2" sx={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{item.quantity}</Typography>
                      <IconButton size="small" color="primary" onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}>
                        <AddCircleOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Stack>
                </Box>
              ))}
              {!cart.items.length && (
                <Box sx={{ py: 4, textAlign: "center" }}>
                   <Typography color="text.secondary" variant="body2">Your cart is empty.</Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Box sx={{ p: 3, bgcolor: "background.paper" }}>
            <Stack spacing={2}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>
                  ${subtotal.toFixed(2)}
                </Typography>
              </Stack>
              <Divider />
              <Grid container spacing={1}>
                <Grid size={{ xs: 6 }}>
                  <Button variant="outlined" fullWidth onClick={() => dispatch(holdOrder())} disabled={!cart.items.length}>Hold</Button>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Button variant="outlined" color="error" fullWidth startIcon={<DeleteIcon />} onClick={() => dispatch(clearCart())} disabled={!cart.items.length}>Clear</Button>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    disabled={!cart.items.length} 
                    onClick={() => setOpenCheckout(true)}
                    sx={{ py: 1.5, fontSize: "1.1rem" }}
                  >
                    Checkout Now
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </Paper>
      </Grid>

      <Dialog open={openCheckout} onClose={() => setOpenCheckout(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>Confirm Payment</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body1" gutterBottom>The total amount to be paid is</Typography>
          <Typography variant="h3" color="primary" sx={{ fontWeight: 900, my: 2 }}>
            ${subtotal.toFixed(2)}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button fullWidth variant="outlined" onClick={() => setOpenCheckout(false)}>Cancel</Button>
          <Button fullWidth variant="contained" size="large" disabled={isSubmitting} onClick={async () => {
            try {
              const result = await createOrder({
                items: cart.items.map((x) => ({
                  productId: x.productId,
                  quantity: x.quantity,
                })),
              }).unwrap();
              show(`Order #${result.orderNumber} completed`, "success");
              dispatch(clearCart());
              setOpenCheckout(false);
            } catch (error) {
              show(error instanceof Error ? error.message : "Could not complete order", "error");
            }
          }}>Pay & Finish</Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
