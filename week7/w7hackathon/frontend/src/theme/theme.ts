import { createTheme, alpha } from "@mui/material/styles";

export const buildTheme = (isDarkMode: boolean) =>
  createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: { main: "#6366f1" }, // Indigo
      secondary: { main: "#f43f5e" }, // Rose
      background: {
        default: isDarkMode ? "#0f172a" : "#f8fafc",
        paper: isDarkMode ? "#1e293b" : "#ffffff",
      },
      text: {
        primary: isDarkMode ? "#f1f5f9" : "#1e293b",
        secondary: isDarkMode ? "#94a3b8" : "#64748b",
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h5: { fontWeight: 700, letterSpacing: "-0.02em" },
      h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    },
    shadows: [
      "none",
      "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      ...Array(20).fill("none"), // Fill rest to avoid errors
    ] as any,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
        },
        variants: [
          {
            props: { variant: "contained", color: "primary" },
            style: {
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              color: "#fff",
            },
          },
        ],
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${isDarkMode ? alpha("#ffffff", 0.05) : alpha("#000000", 0.05)}`,
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            width: 240,
            backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
            borderRight: `1px solid ${isDarkMode ? alpha("#ffffff", 0.1) : alpha("#000000", 0.1)}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? alpha("#0f172a", 0.8) : alpha("#ffffff", 0.8),
            backdropFilter: "blur(12px)",
            color: isDarkMode ? "#f1f5f9" : "#1e293b",
            borderBottom: `1px solid ${isDarkMode ? alpha("#ffffff", 0.1) : alpha("#000000", 0.1)}`,
          },
        },
      },
    },
  });
