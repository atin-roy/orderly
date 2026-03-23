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
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "CASH_ON_DELIVERY";
  createdAt: string;
}
