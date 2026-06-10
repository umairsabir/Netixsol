"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "POS", href: "/pos", icon: <PointOfSaleIcon /> },
  { label: "Products", href: "/products", icon: <ShoppingBagIcon /> },
  { label: "Categories", href: "/categories", icon: <ListAltIcon /> },
  { label: "Raw Materials", href: "/raw-materials", icon: <Inventory2Icon /> },
  { label: "Orders", href: "/orders", icon: <ListAltIcon /> },
  { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const content = (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">POS System</Typography>
      </Box>
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItemButton key={item.href} LinkComponent={Link} href={item.href} selected={pathname.startsWith(item.href)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {content}
      </Drawer>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
}
