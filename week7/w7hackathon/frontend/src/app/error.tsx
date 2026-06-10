"use client";

import Link from "next/link";
import { Alert, Box, Button, Stack } from "@mui/material";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Stack spacing={2} sx={{ maxWidth: 500 }}>
        <Alert severity="error">Something went wrong. {process.env.NODE_ENV === "development" ? error.message : ""}</Alert>
        <Button variant="contained" onClick={reset}>Try Again</Button>
        <Link href="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
      </Stack>
    </Box>
  );
}
