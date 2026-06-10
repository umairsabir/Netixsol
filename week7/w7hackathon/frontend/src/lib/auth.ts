import Cookies from "js-cookie";
import type { AuthToken } from "@/types";

const TOKEN_KEY = "pos_access_token";
const REFRESH_TOKEN_KEY = "pos_refresh_token";
const EXPIRES_AT_KEY = "pos_expires_at";

export function setToken(token: AuthToken) {
  const expiresAt = Date.now() + token.expiresIn * 1000;
  localStorage.setItem(TOKEN_KEY, token.accessToken);
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
  Cookies.set(TOKEN_KEY, token.accessToken);

  if (token.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token.refreshToken);
    Cookies.set(REFRESH_TOKEN_KEY, token.refreshToken);
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) ?? Cookies.get(TOKEN_KEY) ?? null;
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY) ?? Cookies.get(REFRESH_TOKEN_KEY) ?? null;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function isTokenExpired(token?: string | null) {
  if (!token) return true;
  if (typeof window === "undefined") return true;

  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
  if (expiresAt && Date.now() > Number(expiresAt)) return true;

  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(tokenParts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}
