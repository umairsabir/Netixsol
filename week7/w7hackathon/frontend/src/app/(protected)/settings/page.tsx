"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useChangePasswordMutation, useGetConfigQuery, useGetUsersQuery, useInviteUserMutation, useUpdateGeneralMutation, useUpdateNotificationsMutation, useUpdateUserMutation } from "@/store/api/settingsApi";

const generalSchema = z.object({ businessName: z.string().min(2), currencySymbol: z.string().min(1), taxRate: z.coerce.number().min(0).max(100) });

export default function SettingsPage() {
  const [tab, setTab] = useState(0);
  const { data: config } = useGetConfigQuery(undefined);
  const { data: users = [] } = useGetUsersQuery(undefined);
  const [updateGeneral] = useUpdateGeneralMutation();
  const [updateNotifications] = useUpdateNotificationsMutation();
  const [inviteUser] = useInviteUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [changePassword] = useChangePasswordMutation();
  const form = useForm({ resolver: zodResolver(generalSchema), values: { businessName: config?.businessName ?? "", currencySymbol: config?.currencySymbol ?? "$", taxRate: config?.taxRate ?? 0 } });
  const getUserId = (user: { id?: string; _id?: string }) => user.id ?? user._id ?? "";

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Settings</Typography>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}><Tab label="General" /><Tab label="Notifications" /><Tab label="Users" /><Tab label="Account" /></Tabs>
      {tab === 0 && <Stack spacing={2}><TextField label="Business Name" slotProps={{ inputLabel: { shrink: true } }} {...form.register("businessName")} /><TextField label="Currency" slotProps={{ inputLabel: { shrink: true } }} {...form.register("currencySymbol")} /><TextField type="number" label="Tax Rate" slotProps={{ inputLabel: { shrink: true } }} {...form.register("taxRate")} /><Button variant="contained" onClick={form.handleSubmit((values) => updateGeneral(values))}>Save General</Button></Stack>}
      {tab === 1 && <Stack spacing={2}><Button variant="contained" onClick={() => updateNotifications({ emailAlerts: true, alertEmail: config?.alertEmail ?? "" })}>Enable Email Alerts</Button></Stack>}
      {tab === 2 && <Stack spacing={1}>{users.map((u) => <Box key={getUserId(u)} sx={{ p: 1, border: "1px solid", borderColor: "divider" }}>{u.name} ({u.role}) <Button size="small" onClick={() => updateUser({ id: getUserId(u), body: { status: u.status === "active" ? "inactive" : "active" } })}>Toggle</Button></Box>)}<Button onClick={() => inviteUser({ name: "New User", email: "new@company.com", role: "cashier" })}>Invite Demo User</Button></Stack>}
      {tab === 3 && <Stack spacing={2}><TextField type="password" label="Current Password" /><TextField type="password" label="New Password" /><Button variant="contained" onClick={() => changePassword({ currentPassword: "oldpass", newPassword: "newpass123" })}>Change Password</Button></Stack>}
    </Stack>
  );
}
