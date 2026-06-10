"use client";

import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { BarChart, LineChart } from "@mui/x-charts";
import { format } from "date-fns";
import { useGetDashboardSummaryQuery } from "@/store/api/dashboardApi";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardSummaryQuery({}, { pollingInterval: 60000 });

  const kpis = [
    ["Revenue Today", `$${(data?.totalSalesToday ?? 0).toFixed(2)}`],
    ["Orders Today", data?.ordersToday ?? 0],
    ["Active Products", data?.totalProducts ?? 0],
    ["Low Stock Alerts", data?.lowStockAlertCount ?? 0],
  ];

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {kpis.map(([label, value]) => (
          <Grid key={String(label)} size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <SkeletonCard />
            ) : (
              <Card sx={{ height: "100%", display: "flex", alignItems: "center" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography color="text.secondary" variant="overline" sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ minHeight: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Sales Trend (Last 7 Days)
              </Typography>
              {data?.chartData?.length ? (
                <LineChart 
                  height={320} 
                  margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
                  xAxis={[{ 
                    data: data.chartData.map((x) => x.date), 
                    scaleType: "point",
                    valueFormatter: (v) => format(new Date(v), "MMM d")
                  }]} 
                  series={[{ 
                    data: data.chartData.map((x) => x.revenue), 
                    label: "Revenue ($)",
                    area: true,
                    color: "#2563eb"
                  }]} 
                />
              ) : (
                <Box sx={{ height: 320 }}>
                  <EmptyState title="No recent sales" description="Revenue data will appear once orders are completed." />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ minHeight: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Top 5 Products
              </Typography>
              {data?.topProducts?.length ? (
                <BarChart 
                  height={320} 
                  layout="horizontal"
                  margin={{ left: 120, right: 20, top: 20, bottom: 40 }}
                  yAxis={[{ 
                    data: data.topProducts.map((x) => x.name.length > 15 ? x.name.substring(0, 15) + "..." : x.name), 
                    scaleType: "band" 
                  }]} 
                  series={[{ 
                    data: data.topProducts.map((x) => x.units), 
                    label: "Units Sold",
                    color: "#8b5cf6"
                  }]} 
                />
              ) : (
                <Box sx={{ height: 320 }}>
                  <EmptyState title="No top products" description="Complete some orders to see which products sell best." />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
