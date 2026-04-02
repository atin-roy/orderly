export interface CartItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  price: number;
  quantity: number;
  note: string | null;
  lineTotal: number;
}

export interface CartCharges {
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  discount: number;
  total: number;
}

export interface Cart {
  cartId: number | null;
  restaurantId: number | null;
  restaurantName: string | null;
  restaurantCuisine: string | null;
  deliveryTimeMinutes: number | null;
  imageColor: string | null;
  items: CartItem[];
  charges: CartCharges;
}
