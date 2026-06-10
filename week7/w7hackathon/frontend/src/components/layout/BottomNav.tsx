"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { value: "/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
  { value: "/pos", icon: <PointOfSaleIcon />, label: "POS" },
  { value: "/products", icon: <ShoppingBagIcon />, label: "Products" },
  { value: "/categories", icon: <ListAltIcon />, label: "Categories" },
  { value: "/raw-materials", icon: <Inventory2Icon />, label: "Materials" },
  { value: "/orders", icon: <ListAltIcon />, label: "Orders" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Paper sx={{ position: "fixed", display: { xs: "block", md: "none" }, bottom: 0, left: 0, right: 0, zIndex: 1200 }}>
      <BottomNavigation value={tabs.find((tab) => pathname.startsWith(tab.value))?.value ?? "/dashboard"} onChange={(_, value) => router.push(value)}>
        {tabs.map((tab) => (
          <BottomNavigationAction key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
