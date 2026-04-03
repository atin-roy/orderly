import type {
  AdminDashboardData,
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
  priceLevel: string;
  imageColor?: string;
}

export interface UpdateRestaurantPayload extends CreateRestaurantPayload {
  isActive?: boolean;
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

export async function getCart(): Promise<ApiResponse<Cart>> {
  return apiClient<Cart>("/cart");
}

export async function addToCart(payload: AddToCartPayload): Promise<ApiResponse<Cart>> {
  return apiClient<Cart>("/cart/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCartItem(
  itemId: number,
  payload: UpdateCartItemPayload
): Promise<ApiResponse<Cart>> {
  return apiClient<Cart>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function removeCartItem(itemId: number): Promise<ApiResponse<Cart>> {
  return apiClient<Cart>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<ApiResponse<void>> {
  return apiClient<void>("/cart", {
    method: "DELETE",
  });
}

export async function getCoupons(): Promise<ApiResponse<Coupon[]>> {
  return apiClient<Coupon[]>("/coupons");
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

export async function getAdminDashboard(): Promise<ApiResponse<AdminDashboardData>> {
  return apiClient<AdminDashboardData>("/orders/admin/dashboard");
}

export async function getAdminRestaurants(): Promise<ApiResponse<AdminRestaurantSummary[]>> {
  return apiClient<AdminRestaurantSummary[]>("/restaurants/admin/overview");
}
