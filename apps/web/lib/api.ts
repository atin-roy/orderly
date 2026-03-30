import type { ApiResponse } from "@orderly/types";

export async function apiClient<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  return res.json() as Promise<ApiResponse<T>>;
}

export interface AuthResponseData {
  token: string;
  email: string;
  role: string;
}

export async function authLogin(email: string, password: string): Promise<AuthResponseData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  const data: AuthResponseData = await res.json();
  localStorage.setItem("token", data.token);
  return data;
}

export async function authRegister(email: string, password: string, phone: string): Promise<AuthResponseData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, phone }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || "Registration failed");
  }

  const data: AuthResponseData = await res.json();
  localStorage.setItem("token", data.token);
  return data;
}
