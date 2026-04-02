export enum OrderStatus {
  PLACED = "PLACED",
  ACCEPTED = "ACCEPTED",
  PREPARING = "PREPARING",
  READY = "READY",
  PICKED_UP = "PICKED_UP",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
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
}

export interface OrdersPage {
  orders: {
    content: OrderSummary[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  activeOrder: Order | null;
}
