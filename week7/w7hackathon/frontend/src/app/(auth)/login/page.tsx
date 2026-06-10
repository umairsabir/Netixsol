"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Card, CardContent, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import styles from "./login.module.css";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional(),
});

  type FormValues = z.infer<typeof schema>;
  
  export default function LoginPage() {
    const { login } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState, setValue } = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: { rememberMe: true },
    });
  
    return (
      <Box className={styles.wrapper}>
        <Card className={styles.card}>
          <CardContent>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
              Sign in
            </Typography>
            <Stack component="form" spacing={2} onSubmit={handleSubmit(async (values) => {
              try {
                setError(null);
                await login(values.email, values.password);
              } catch (err) {
                const errorMessage =
                  typeof err === "object" &&
                  err !== null &&
                  "data" in err &&
                  typeof err.data === "object" &&
                  err.data !== null &&
                  "message" in err.data &&
                  typeof err.data.message === "string"
                    ? err.data.message
                    : err instanceof Error
                      ? err.message
                      : "Login failed";
                setError(errorMessage);
              }
            })}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Email" type="email" {...register("email")} error={!!formState.errors.email} helperText={formState.errors.email?.message} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="Password" type="password" {...register("password")} error={!!formState.errors.password} helperText={formState.errors.password?.message} slotProps={{ inputLabel: { shrink: true } }} />
              <FormControlLabel control={<Checkbox {...register("rememberMe")} />} label="Remember me" />
              <Button type="submit" variant="contained" disabled={formState.isSubmitting}>Sign In</Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }
