"use client";

import { useRouter } from "next/navigation";
import { clearToken, setToken } from "@/lib/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthState, setAuthState } from "@/store/slices/authSlice";
import { useLoginMutation, useLogoutMutation } from "@/store/api/authApi";

export function useAuth() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const auth = useAppSelector((state) => state.auth);

  async function login(email: string, password: string) {
    const result = await loginMutation({ email, password }).unwrap();
    setToken(result);
    dispatch(setAuthState({ user: result.user, isAuthenticated: true }));
    router.replace("/dashboard");
  }

  async function logout() {
    await logoutMutation().catch(() => undefined);
    clearToken();
    dispatch(clearAuthState());
    router.replace("/login");
  }

  return { ...auth, login, logout };
}
