import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/types";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  availableStock: number;
}

interface CartState {
  items: CartItem[];
  discountType: "%" | "$";
  discountValue: number;
  heldOrders: Array<{ id: string; createdAt: string; items: CartItem[] }>;
}

const initialState: CartState = { items: [], discountType: "%", discountValue: 0, heldOrders: [] };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const existing = state.items.find((item) => item.productId === action.payload.id);
      if (existing) existing.quantity = Math.min(existing.quantity + 1, existing.availableStock);
      else
        state.items.push({
          productId: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          quantity: 1,
          availableStock: action.payload.availableStock,
        });
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (!item) return;
      item.quantity = Math.max(0, Math.min(action.payload.quantity, item.availableStock));
      state.items = state.items.filter((i) => i.quantity > 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.discountValue = 0;
    },
    setDiscount: (state, action: PayloadAction<{ type: "%" | "$"; value: number }>) => {
      state.discountType = action.payload.type;
      state.discountValue = action.payload.value;
    },
    holdOrder: (state) => {
      if (!state.items.length) return;
      state.heldOrders.push({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), items: state.items });
      state.items = [];
    },
    restoreHeldOrder: (state, action: PayloadAction<string>) => {
      const order = state.heldOrders.find((item) => item.id === action.payload);
      if (!order) return;
      state.items = order.items;
      state.heldOrders = state.heldOrders.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addToCart, updateQuantity, clearCart, setDiscount, holdOrder, restoreHeldOrder } = cartSlice.actions;
export default cartSlice.reducer;
