"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { buildTheme } from "./theme";

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const theme = useMemo(() => buildTheme(isDarkMode), [isDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
