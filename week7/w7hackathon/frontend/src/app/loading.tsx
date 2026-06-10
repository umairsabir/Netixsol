import { Box, CircularProgress } from "@mui/material";

export default function Loading() {
  return <Box sx={{ minHeight: "30vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
}
