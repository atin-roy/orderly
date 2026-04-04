import type {
  AdminCoupon,
  AdminDashboardData,
  AdminDeliveryPartner,
  AdminRestaurantSummary,
  ApiResponse,
  Cart,
  Coupon,
  CouponValidation,
  DeliveryDashboard,
  MenuCategory,
  Order,
  OwnerDashboardData,
  OrdersPage,
  PaginatedResponse,
  Restaurant,
  UserAddress,
  UserProfile,
} from "@orderly/types";
import {
  clearStoredSession,
  getStoredToken,
  persistSession,
} from "@/lib/auth-session";

const API_UNAVAILABLE_MESSAGE =
  "Orderly API is unavailable. Start the Docker Compose stack or the backend server and try again.";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "/api";
}

export function resolveAssetUrl(path?: string | null) {
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = getApiBaseUrl();
  if (/^https?:\/\//i.test(baseUrl)) {
    try {
      return new URL(path, baseUrl).toString();
    } catch {
      return path;
    }
  }

  return path;
}

const CART_UPDATED_EVENT = "orderly:cart-updated";

function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

export function getCartUpdatedEventName() {
  return CART_UPDATED_EVENT;
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
  if (res.status === 413) {
    return "Image exceeds the 5 MB limit.";
  }

  const errorText = await res.text().catch(() => "");
  if (!errorText) {
    return fallbackMessage;
  }

  try {
    const errorData = JSON.parse(errorText) as { message?: string };
    if (errorData.message) {
      return errorData.message;
    }
  } catch {
    return errorText;
  }

  return errorText;
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  fallbackMessage = "Request failed"
): Promise<T> {
  const baseUrl = getApiBaseUrl();

  const token = getStoredToken();
  const headers = new Headers(options.headers);

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body && !isFormData) {
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

      const message = await parseErrorMessage(res, fallbackMessage);

      // Spring Security can return a bare 403 for stale or invalid JWTs.
      if (res.status === 403 && message === fallbackMessage) {
        clearStoredSession();
        throw new Error("Your session expired. Please log in again.");
      }

      throw new Error(message);
    }

    if (res.status === 204) {
      return undefined as T;
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

export type AdminCreateDeliveryPartnerPayload = DeliveryRegisterPayload;

export interface AdminUpdateDeliveryPartnerPayload {
  fullName: string;
  email: string;
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
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

export interface UpdateProfilePayload {
  name: string | null;
  phone: string;
}

export interface CreateRestaurantPayload {
  name: string;
  description?: string;
  cuisineType: string;
  city: string;
  locality: string;
  imageUrl?: string;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  imageColor?: string;
}

export interface UpdateRestaurantPayload extends CreateRestaurantPayload {
  isActive?: boolean;
}

export interface AdminCreateRestaurantPayload extends CreateRestaurantPayload {
  ownerName: string;
  businessName: string;
  email: string;
  password: string;
  phone: string;
  serviceArea: string;
  businessType: string;
  cuisineFocus: string;
  restaurantCity: string;
}

export interface ImageUploadResponse {
  url: string;
}

export interface CouponPayload {
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  enabled?: boolean;
}

export interface MenuItemPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  category: string;
  isAvailable?: boolean;
  isVeg?: boolean;
  sortOrder?: number;
}

export interface AddToCartPayload {
  menuItemId: number;
  quantity: number;
  note?: string;
}

export interface UpdateCartItemPayload {
  quantity: number;
  note?: string;
}

export interface PlaceOrderPayload {
  addressId: number;
  paymentMethod: string;
  paymentProvider?: string;
  paymentStatus?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  couponCode?: string;
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

export async function updateMyProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  return requestJson<UserProfile>(
    "/profile/me",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    "Unable to update profile"
  );
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

export async function deleteUserAddress(addressId: number): Promise<void> {
  await requestJson<void>(
    `/profile/addresses/${addressId}`,
    {
      method: "DELETE",
    },
    "Unable to delete address"
  );
}

export async function getRestaurants(
  options: {
    page?: number;
    size?: number;
    query?: string;
    locality?: string;
    isVeg?: boolean;
    sort?: string;
  } = {}
): Promise<ApiResponse<PaginatedResponse<Restaurant>>> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 0));
  params.set("size", String(options.size ?? 12));
  if (options.query) {
    params.set("query", options.query);
  }
  if (options.locality) {
    params.set("locality", options.locality);
  }
  if (options.isVeg !== undefined) {
    params.set("isVeg", String(options.isVeg));
  }
  if (options.sort) {
    params.set("sort", options.sort);
  }

  return apiClient<PaginatedResponse<Restaurant>>(`/restaurants?${params.toString()}`);
}

export async function getRestaurant(restaurantId: number): Promise<ApiResponse<Restaurant>> {
  return apiClient<Restaurant>(`/restaurants/${restaurantId}`);
}

export async function getRestaurantMenu(
  restaurantId: number
): Promise<ApiResponse<MenuCategory[]>> {
  return apiClient<MenuCategory[]>(`/restaurants/${restaurantId}/menu`);
}

export async function getRestaurantLocalities(city = "Kolkata"): Promise<ApiResponse<string[]>> {
  return apiClient<string[]>(`/restaurants/localities?city=${encodeURIComponent(city)}`);
}

export async function getMyRestaurants(): Promise<ApiResponse<Restaurant[]>> {
  return apiClient<Restaurant[]>("/restaurants/mine");
}

export async function getAdminRestaurantOverview(options: {
  page?: number;
  size?: number;
  query?: string;
  status?: string;
} = {}): Promise<ApiResponse<PaginatedResponse<AdminRestaurantSummary>>> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 0));
  params.set("size", String(options.size ?? 10));
  if (options.query) {
    params.set("query", options.query);
  }
  if (options.status) {
    params.set("status", options.status);
  }
  return apiClient<PaginatedResponse<AdminRestaurantSummary>>(
    `/restaurants/admin/overview?${params.toString()}`
  );
}

export async function getAdminRestaurant(restaurantId: number): Promise<ApiResponse<Restaurant>> {
  return apiClient<Restaurant>(`/restaurants/admin/${restaurantId}`);
}

export async function createRestaurant(
  payload: CreateRestaurantPayload
): Promise<ApiResponse<Restaurant>> {
  return apiClient<Restaurant>("/restaurants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRestaurant(
  restaurantId: number,
  payload: UpdateRestaurantPayload
): Promise<ApiResponse<Restaurant>> {
  return apiClient<Restaurant>(`/restaurants/${restaurantId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteRestaurant(restaurantId: number): Promise<ApiResponse<void>> {
  return apiClient<void>(`/restaurants/${restaurantId}`, {
    method: "DELETE",
  });
}

export async function adminCreateRestaurant(
  payload: AdminCreateRestaurantPayload
): Promise<ApiResponse<Restaurant>> {
  return apiClient<Restaurant>("/restaurants/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createMenuItem(
  restaurantId: number,
  payload: MenuItemPayload
): Promise<ApiResponse<unknown>> {
  return apiClient(`/restaurants/${restaurantId}/menu`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMenuItem(
  restaurantId: number,
  itemId: number,
  payload: MenuItemPayload
): Promise<ApiResponse<unknown>> {
  return apiClient(`/restaurants/${restaurantId}/menu/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteMenuItem(
  restaurantId: number,
  itemId: number
): Promise<ApiResponse<void>> {
  return apiClient<void>(`/restaurants/${restaurantId}/menu/${itemId}`, {
    method: "DELETE",
  });
}

export async function getManagementMenu(
  restaurantId: number
): Promise<ApiResponse<MenuCategory[]>> {
  return apiClient<MenuCategory[]>(`/restaurants/${restaurantId}/menu/manage`);
}

export async function uploadImage(file: File): Promise<ApiResponse<ImageUploadResponse>> {
  const body = new FormData();
  body.set("file", file);

  return apiClient<ImageUploadResponse>("/uploads/images", {
    method: "POST",
    body,
  });
}

export async function getCart(): Promise<ApiResponse<Cart>> {
  return apiClient<Cart>("/cart");
}

export async function addToCart(payload: AddToCartPayload): Promise<ApiResponse<Cart>> {
  const response = await apiClient<Cart>("/cart/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  notifyCartUpdated();
  return response;
}

export async function updateCartItem(
  itemId: number,
  payload: UpdateCartItemPayload
): Promise<ApiResponse<Cart>> {
  const response = await apiClient<Cart>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  notifyCartUpdated();
  return response;
}

export async function removeCartItem(itemId: number): Promise<ApiResponse<Cart>> {
  const response = await apiClient<Cart>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
  notifyCartUpdated();
  return response;
}

export async function clearCart(): Promise<ApiResponse<void>> {
  const response = await apiClient<void>("/cart", {
    method: "DELETE",
  });
  notifyCartUpdated();
  return response;
}

export async function getCoupons(): Promise<ApiResponse<Coupon[]>> {
  return apiClient<Coupon[]>("/coupons");
}

export async function getAdminCoupons(options: {
  page?: number;
  size?: number;
  query?: string;
  status?: string;
} = {}): Promise<ApiResponse<PaginatedResponse<AdminCoupon>>> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 0));
  params.set("size", String(options.size ?? 10));
  if (options.query) {
    params.set("query", options.query);
  }
  if (options.status) {
    params.set("status", options.status);
  }
  return apiClient<PaginatedResponse<AdminCoupon>>(`/coupons/admin?${params.toString()}`);
}

export async function createCoupon(payload: CouponPayload): Promise<ApiResponse<AdminCoupon>> {
  return apiClient<AdminCoupon>("/coupons/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCoupon(
  couponId: number,
  payload: Required<CouponPayload>
): Promise<ApiResponse<AdminCoupon>> {
  return apiClient<AdminCoupon>(`/coupons/admin/${couponId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateCouponStatus(
  couponId: number,
  enabled: boolean
): Promise<ApiResponse<AdminCoupon>> {
  return apiClient<AdminCoupon>(`/coupons/admin/${couponId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

export async function deleteCoupon(couponId: number): Promise<ApiResponse<void>> {
  return apiClient<void>(`/coupons/admin/${couponId}`, {
    method: "DELETE",
  });
}

export async function validateCoupon(code: string): Promise<ApiResponse<CouponValidation>> {
  return apiClient<CouponValidation>("/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function placeOrder(
  payload: PlaceOrderPayload
): Promise<ApiResponse<Order>> {
  return apiClient<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getOrders(page = 0, size = 4): Promise<ApiResponse<OrdersPage>> {
  return apiClient<OrdersPage>(`/orders?page=${page}&size=${size}`);
}

export async function getOrder(orderId: number): Promise<ApiResponse<Order>> {
  return apiClient<Order>(`/orders/${orderId}`);
}

export async function getDeliveryDashboard(): Promise<ApiResponse<DeliveryDashboard>> {
  return apiClient<DeliveryDashboard>("/orders/delivery/dashboard");
}

export async function getOwnerDashboard(): Promise<ApiResponse<OwnerDashboardData>> {
  return apiClient<OwnerDashboardData>("/orders/owner/dashboard");
}

export async function getAdminDashboard(
  page = 0,
  size = 6
): Promise<ApiResponse<AdminDashboardData>> {
  return apiClient<AdminDashboardData>(`/orders/admin/dashboard?page=${page}&size=${size}`);
}

export async function getAdminDeliveryPartners(options: {
  page?: number;
  size?: number;
  query?: string;
  shift?: string;
} = {}): Promise<ApiResponse<PaginatedResponse<AdminDeliveryPartner>>> {
  const params = new URLSearchParams();
  params.set("page", String(options.page ?? 0));
  params.set("size", String(options.size ?? 10));
  if (options.query) {
    params.set("query", options.query);
  }
  if (options.shift) {
    params.set("shift", options.shift);
  }
  return apiClient<PaginatedResponse<AdminDeliveryPartner>>(
    `/users/admin/delivery-partners?${params.toString()}`
  );
}

export async function createAdminDeliveryPartner(
  payload: AdminCreateDeliveryPartnerPayload
): Promise<ApiResponse<AdminDeliveryPartner>> {
  return apiClient<AdminDeliveryPartner>("/users/admin/delivery-partners", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminDeliveryPartner(
  partnerId: number,
  payload: AdminUpdateDeliveryPartnerPayload
): Promise<ApiResponse<AdminDeliveryPartner>> {
  return apiClient<AdminDeliveryPartner>(`/users/admin/delivery-partners/${partnerId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminDeliveryPartner(
  partnerId: number
): Promise<ApiResponse<void>> {
  return apiClient<void>(`/users/admin/delivery-partners/${partnerId}`, {
    method: "DELETE",
  });
}
