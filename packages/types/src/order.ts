import type { PaginatedResponse } from "./common";

export enum OrderStatus {
  PLACED = "PLACED",
  ACCEPTED = "ACCEPTED",
  PREPARING = "PREPARING",
  READY = "READY",
  PICKED_UP = "PICKED_UP",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface DeliveryPartnerSummary {
  id: number;
  name: string;
  phone: string;
  vehicleType: string;
  preferredShift: string;
  serviceZones: string;
  avatarUrl: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  restaurantId: number;
  restaurantName: string;
  restaurantCuisine: string;
  imageColor: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPhone: string;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  paymentMethod: string;
  paymentProvider: string;
  paymentStatus: string;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  discount: number;
  couponCode: string | null;
  total: number;
  estimatedDeliveryMinutes: number;
  itemCount: number;
  timeLabel: string;
  estimatedArrival: string | null;
  deliveredAt: string | null;
  deliveryPartner: DeliveryPartnerSummary | null;
  createdDate: string;
  items: OrderItem[];
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
}

export interface OrderTimelineEntry {
  label: string;
  timestamp: string;
  time: string;
  complete: boolean;
}

export interface OrderSummary {
  id: number;
  restaurantName: string;
  restaurantCuisine: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  timeLabel: string;
  paymentMethod: string;
  imageColor: string;
  estimatedArrival: string | null;
  deliveredAt: string | null;
  deliveryPartner: DeliveryPartnerSummary | null;
}

export interface OrdersPage {
  orders: {
    content: OrderSummary[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  activeOrders: Order[];
}

export interface DeliveryTask {
  id: number;
  restaurantName: string;
  restaurantCuisine: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  total: number;
  status: OrderStatus;
  estimatedArrival: string | null;
  timeLabel: string;
  imageColor: string;
}

export interface DeliveryDashboard {
  partner: DeliveryPartnerSummary | null;
  activeOrders: DeliveryTask[];
  recentOrders: DeliveryTask[];
}

export interface OwnerLiveOrder {
  id: number;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  estimatedArrival: string | null;
  timeLabel: string;
  deliveryPartner: DeliveryPartnerSummary | null;
}

export interface OwnerDashboardData {
  activeOrders: number;
  liveOrders: OwnerLiveOrder[];
}

export interface AdminLiveOrder {
  id: number;
  restaurantName: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  estimatedArrival: string | null;
  deliveryPartner: DeliveryPartnerSummary | null;
}

export interface AdminDashboardData {
  activeOrders: number;
  activeRiders: number;
  deliveredToday: number;
  cancelledToday: number;
  totalRestaurants: number;
  totalDeliveryPartners: number;
  liveOrders: PaginatedResponse<AdminLiveOrder>;
}

export interface AdminDeliveryPartner {
  id: number;
  name: string | null;
  email: string;
  phone: string;
  city: string;
  vehicleType: string;
  preferredShift: string;
  serviceZones: string;
  deliveryExperience: string;
  avatarUrl: string;
  activeOrders: number;
  activeNow: boolean;
}
