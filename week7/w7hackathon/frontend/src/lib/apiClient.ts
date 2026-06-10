const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const hasApiBaseUrl = API_BASE_URL.length > 0;
