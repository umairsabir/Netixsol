"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { AppBar, Avatar, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthState } from "@/store/slices/authSlice";
import { toggleDarkMode } from "@/store/slices/themeSlice";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  return (
    <AppBar position="sticky" color="inherit" elevation={1}>
      <Toolbar>
        <IconButton onClick={onMenuClick} sx={{ display: { md: "none" }, mr: 1 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, textTransform: "capitalize" }}>
          {pathname.split("/")[1] || "Dashboard"}
        </Typography>
        <Tooltip title="Toggle theme">
          <IconButton onClick={() => dispatch(toggleDarkMode())}>{isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}</IconButton>
        </Tooltip>
        <Avatar sx={{ ml: 1 }}>{user?.name?.charAt(0) ?? "U"}</Avatar>
        <IconButton
          onClick={() => {
            clearToken();
            dispatch(clearAuthState());
            router.replace("/login");
          }}
        >
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
