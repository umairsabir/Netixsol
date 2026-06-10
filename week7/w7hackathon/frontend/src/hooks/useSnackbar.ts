import { enqueueSnackbar } from "@/store/slices/snackbarSlice";
import { useAppDispatch } from "@/store/hooks";

export function useSnackbar() {
  const dispatch = useAppDispatch();

  return {
    show: (message: string, severity: "success" | "error" | "info" | "warning" = "info") =>
      dispatch(enqueueSnackbar({ message, severity })),
  };
}
