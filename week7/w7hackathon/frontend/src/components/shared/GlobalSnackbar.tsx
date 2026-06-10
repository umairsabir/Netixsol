"use client";

import { Alert, Snackbar } from "@mui/material";
import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { dequeueSnackbar } from "@/store/slices/snackbarSlice";

export function GlobalSnackbar() {
  const dispatch = useAppDispatch();
  const queue = useAppSelector((state) => state.snackbar.queue);
  const current = useMemo(() => queue[0], [queue]);

  return (
    <Snackbar
      open={Boolean(current)}
      autoHideDuration={current?.severity === "error" ? null : 3000}
      onClose={() => dispatch(dequeueSnackbar())}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={() => dispatch(dequeueSnackbar())} severity={current?.severity ?? "info"} sx={{ width: "100%" }}>
        {current?.message}
      </Alert>
    </Snackbar>
  );
}
