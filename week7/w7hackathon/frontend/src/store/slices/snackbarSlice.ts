import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SnackbarMessage {
  id: string;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface SnackbarState {
  queue: SnackbarMessage[];
}

const initialState: SnackbarState = { queue: [] };

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    enqueueSnackbar: (state, action: PayloadAction<Omit<SnackbarMessage, "id">>) => {
      state.queue.push({ id: crypto.randomUUID(), ...action.payload });
    },
    dequeueSnackbar: (state) => {
      state.queue.shift();
    },
  },
});

export const { enqueueSnackbar, dequeueSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;
