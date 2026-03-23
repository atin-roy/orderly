import type { ApiResponse } from "@orderly/types";

// TODO: Replace stub with real implementation once Keycloak session integration is in place.
// This function should retrieve the Bearer token from the Keycloak session and attach it
// to every outgoing request header.
export async function apiClient<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = ""; // TODO: get token from Keycloak session

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  return res.json() as Promise<ApiResponse<T>>;
}
