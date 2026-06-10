import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  items: string[]; // List of car IDs
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    toggleWishlistItem: (state, action: PayloadAction<string>) => {
      const index = state.items.indexOf(action.payload);
      if (index > -1) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
  },
});

export const { setWishlist, toggleWishlistItem } = wishlistSlice.actions;
export default wishlistSlice.reducer;
