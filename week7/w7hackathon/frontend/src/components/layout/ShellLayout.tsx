"use client";

import { Box } from "@mui/material";
import { useState } from "react";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="nav"
        sx={{ width: { md: 240 }, flexShrink: { md: 0 } }}
      >
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - 240px)` },
          pb: { xs: 8, md: 0 },
        }}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <Box sx={{ p: 2 }}>{children}</Box>
      </Box>
      <BottomNav />
    </Box>
  );
}
