import { z } from 'zod';
import { password } from './custom.validation';

export const register = {
  body: z.object({
    email: z.string().email(),
    password: password,
    name: z.string().min(1),
  }),
};

export const login = {
  body: z.object({
    email: z.string().min(1),
    password: z.string().min(1),
  }),
};

export const logout = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const refreshTokens = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const forgotPassword = {
  body: z.object({
    email: z.string().email(),
  }),
};

export const resetPassword = {
  query: z.object({
    token: z.string().min(1),
  }),
  body: z.object({
    password: password,
  }),
};

export const verifyEmail = {
  query: z.object({
    token: z.string().min(1),
  }),
};

// Inferred types
export type RegisterBody = z.infer<typeof register.body>;
export type LoginBody = z.infer<typeof login.body>;
export type LogoutBody = z.infer<typeof logout.body>;
export type RefreshTokensBody = z.infer<typeof refreshTokens.body>;
export type ForgotPasswordBody = z.infer<typeof forgotPassword.body>;
export type ResetPasswordQuery = z.infer<typeof resetPassword.query>;
export type ResetPasswordBody = z.infer<typeof resetPassword.body>;
export type VerifyEmailQuery = z.infer<typeof verifyEmail.query>;
