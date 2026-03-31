import type { ApiResponse, UserAddress, UserProfile } from "@orderly/types";
import {
  clearStoredSession,
  getStoredToken,
  persistSession,
} from "@/lib/auth-session";

const API_UNAVAILABLE_MESSAGE =
  "Orderly API is unavailable. Start the backend on http://localhost:8080 and try again.";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL;
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError;
}

function toApiError(error: unknown, fallbackMessage: string) {
  if (isNetworkError(error)) {
    return new Error(API_UNAVAILABLE_MESSAGE);
  }

  return error instanceof Error ? error : new Error(fallbackMessage);
}

async function parseErrorMessage(res: Response, fallbackMessage: string) {
  const errorData = await res.json().catch(() => null);
  return errorData?.message || fallbackMessage;
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  fallbackMessage = "Request failed"
): Promise<T> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearStoredSession();
      }

      throw new Error(await parseErrorMessage(res, fallbackMessage));
    }

    return res.json() as Promise<T>;
  } catch (error) {
    throw toApiError(error, fallbackMessage);
  }
}

export async function apiClient<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return requestJson<ApiResponse<T>>(path, options, "Request failed");
}

export interface AuthResponseData {
  token: string;
  email: string;
  role: string;
}

export interface BusinessRegisterPayload {
  ownerName: string;
  businessName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  serviceArea: string;
  businessType: string;
  cuisineFocus: string;
}

export interface DeliveryRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  vehicleType: string;
  preferredShift: string;
  serviceZones: string;
  deliveryExperience: string;
}

export interface CreateAddressPayload {
  label: string;
  address: string;
  buildingInfo?: string;
  city?: string;
  phone: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

async function storeAuthResponse(
  path: string,
  body: unknown,
  fallbackMessage: string
): Promise<AuthResponseData> {
  const data = await requestJson<AuthResponseData>(
    path,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    fallbackMessage
  );

  persistSession(data);
  return data;
}

export async function authLogin(email: string, password: string): Promise<AuthResponseData> {
  return storeAuthResponse("/auth/login", { email, password }, "Invalid credentials");
}

export async function authRegisterBusiness(
  payload: BusinessRegisterPayload
): Promise<AuthResponseData> {
  return storeAuthResponse(
    "/auth/register/business",
    payload,
    "Business registration failed"
  );
}

export async function authRegisterDelivery(
  payload: DeliveryRegisterPayload
): Promise<AuthResponseData> {
  return storeAuthResponse(
    "/auth/register/delivery",
    payload,
    "Delivery registration failed"
  );
}

export async function authRegister(
  email: string,
  password: string,
  phone: string
): Promise<AuthResponseData> {
  return storeAuthResponse("/auth/register", { email, password, phone }, "Registration failed");
}

export async function getMyProfile(): Promise<UserProfile> {
  return requestJson<UserProfile>("/profile/me", undefined, "Unable to load profile");
}

export async function createUserAddress(
  payload: CreateAddressPayload
): Promise<UserAddress> {
  return requestJson<UserAddress>(
    "/profile/addresses",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Unable to save address"
  );
}

export async function setDefaultUserAddress(addressId: number): Promise<UserAddress> {
  return requestJson<UserAddress>(
    `/profile/addresses/${addressId}/default`,
    {
      method: "PATCH",
    },
    "Unable to update default address"
  );
}
