import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Stack spacing={2} sx={{ alignItems: "center" }}>
        <Typography variant="h2">404</Typography>
        <Typography>Page not found</Typography>
        <Link href="/dashboard">
          <Button variant="contained">Go to Dashboard</Button>
        </Link>
      </Stack>
    </Box>
  );
}
