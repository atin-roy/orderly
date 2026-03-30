export const mockRestaurants = [
  {
    name: "Saffron Courtyard",
    cuisine: "North Indian Signatures",
    rating: 4.9,
    priceLevel: "₹₹₹",
    deliveryTime: "25-35 min",
    deliveryFee: "FREE DELIVERY",
    imageColor: "bg-gradient-to-br from-orange-500 via-amber-500 to-red-700",
  },
  {
    name: "Coastal Curry House",
    cuisine: "Kerala Seafood",
    rating: 4.8,
    priceLevel: "₹₹₹₹",
    deliveryTime: "35-45 min",
    deliveryFee: "₹89 DELIVERY",
    imageColor: "bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-900",
  },
  {
    name: "Bombay Grill Co.",
    cuisine: "Street Food Favourites",
    rating: 4.7,
    priceLevel: "₹₹",
    deliveryTime: "15-25 min",
    deliveryFee: "FREE DELIVERY",
    imageColor: "bg-gradient-to-br from-fuchsia-700 via-rose-600 to-orange-500",
  },
  {
    name: "Tandoor Terrace",
    cuisine: "Mughlai & Kebabs",
    rating: 4.6,
    priceLevel: "₹₹",
    deliveryTime: "20-30 min",
    deliveryFee: "FREE DELIVERY",
    imageColor: "bg-gradient-to-br from-yellow-700 via-orange-700 to-stone-900",
  },
  {
    name: "Dosa Darbar",
    cuisine: "South Indian Comfort",
    rating: 4.8,
    priceLevel: "₹₹₹",
    deliveryTime: "30-40 min",
    deliveryFee: "₹49 DELIVERY",
    imageColor: "bg-gradient-to-br from-lime-600 via-green-700 to-emerald-900",
  },
  {
    name: "Mithai Mahal",
    cuisine: "Sweets & Desserts",
    rating: 4.5,
    priceLevel: "₹₹₹",
    deliveryTime: "35-45 min",
    deliveryFee: "FREE DELIVERY",
    imageColor: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-700",
  },
];

export const mockCategories = [
  { label: "Thalis", iconKey: "forkKnife" as const },
  { label: "Biryani", iconKey: "sushi" as const },
  { label: "Rolls", iconKey: "burger" as const },
  { label: "Mithai", iconKey: "cake" as const },
  { label: "Kulfi", iconKey: "dessert" as const },
  { label: "Veg", iconKey: "leaf" as const },
  { label: "Dosas", iconKey: "forkKnife" as const },
  { label: "Kebabs", iconKey: "burger" as const },
  { label: "Curries", iconKey: "sushi" as const },
  { label: "Chaat", iconKey: "dessert" as const },
];

export const maitredPick = {
  restaurant: "Saffron Courtyard",
  dish: "Lucknowi Dum Biryani",
  text: `"The Lucknowi Dum Biryani from 'Saffron Courtyard' is the city favourite this evening."`,
};

export type MockOrderStatus =
  | "Preparing"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";

export interface MockOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface MockOrderTimelineEntry {
  label: string;
  time: string;
  complete: boolean;
}

export interface MockOrder {
  id: string;
  restaurantName: string;
  restaurantCuisine: string;
  status: MockOrderStatus;
  orderDate: string;
  timeLabel: string;
  total: number;
  itemCount: number;
  estimatedArrival?: string;
  deliveredAt?: string;
  deliveryAddress: string;
  paymentMethod: string;
  imageColor: string;
  items: MockOrderItem[];
  timeline: MockOrderTimelineEntry[];
}

export const mockOrders: MockOrder[] = [
  {
    id: "ord-saffron-041",
    restaurantName: "Saffron Courtyard",
    restaurantCuisine: "North Indian Signatures",
    status: "Out for delivery",
    orderDate: "2026-03-30",
    timeLabel: "Placed today at 7:12 PM",
    total: 1248,
    itemCount: 4,
    estimatedArrival: "Arriving in 12 min",
    deliveryAddress: "Flat 804, Palm Residency, Bandra West, Mumbai",
    paymentMethod: "Paid via UPI",
    imageColor: "bg-gradient-to-br from-orange-500 via-amber-500 to-red-700",
    items: [
      { name: "Lucknowi Dum Biryani", quantity: 1, price: 449 },
      { name: "Galouti Kebab Platter", quantity: 1, price: 359 },
      { name: "Roomali Roti", quantity: 2, price: 98 },
      { name: "Shahi Tukda", quantity: 1, price: 342 },
    ],
    timeline: [
      { label: "Order placed", time: "7:12 PM", complete: true },
      { label: "Kitchen confirmed", time: "7:15 PM", complete: true },
      { label: "Picked up by rider", time: "7:34 PM", complete: true },
      { label: "Arriving shortly", time: "7:49 PM", complete: false },
    ],
  },
  {
    id: "ord-dosa-982",
    restaurantName: "Dosa Darbar",
    restaurantCuisine: "South Indian Comfort",
    status: "Delivered",
    orderDate: "2026-03-27",
    timeLabel: "Delivered on 27 Mar",
    total: 678,
    itemCount: 3,
    deliveredAt: "Delivered in 29 min",
    deliveryAddress: "Flat 804, Palm Residency, Bandra West, Mumbai",
    paymentMethod: "Paid via Card",
    imageColor: "bg-gradient-to-br from-lime-600 via-green-700 to-emerald-900",
    items: [
      { name: "Ghee Podi Dosa", quantity: 1, price: 219 },
      { name: "Mini Tiffin Combo", quantity: 1, price: 309 },
      { name: "Filter Coffee", quantity: 2, price: 75 },
    ],
    timeline: [
      { label: "Order placed", time: "8:04 PM", complete: true },
      { label: "Prepared", time: "8:18 PM", complete: true },
      { label: "Picked up", time: "8:24 PM", complete: true },
      { label: "Delivered", time: "8:33 PM", complete: true },
    ],
  },
  {
    id: "ord-bombay-301",
    restaurantName: "Bombay Grill Co.",
    restaurantCuisine: "Street Food Favourites",
    status: "Delivered",
    orderDate: "2026-03-23",
    timeLabel: "Delivered on 23 Mar",
    total: 534,
    itemCount: 4,
    deliveredAt: "Delivered in 24 min",
    deliveryAddress: "Flat 804, Palm Residency, Bandra West, Mumbai",
    paymentMethod: "Cash on delivery",
    imageColor: "bg-gradient-to-br from-fuchsia-700 via-rose-600 to-orange-500",
    items: [
      { name: "Paneer Kathi Roll", quantity: 2, price: 159 },
      { name: "Sev Puri", quantity: 1, price: 96 },
      { name: "Masala Fries", quantity: 1, price: 120 },
    ],
    timeline: [
      { label: "Order placed", time: "6:42 PM", complete: true },
      { label: "Prepared", time: "6:55 PM", complete: true },
      { label: "Picked up", time: "7:00 PM", complete: true },
      { label: "Delivered", time: "7:06 PM", complete: true },
    ],
  },
  {
    id: "ord-coastal-114",
    restaurantName: "Coastal Curry House",
    restaurantCuisine: "Kerala Seafood",
    status: "Delivered",
    orderDate: "2026-03-18",
    timeLabel: "Delivered on 18 Mar",
    total: 1480,
    itemCount: 5,
    deliveredAt: "Delivered in 41 min",
    deliveryAddress: "Flat 804, Palm Residency, Bandra West, Mumbai",
    paymentMethod: "Paid via UPI",
    imageColor: "bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-900",
    items: [
      { name: "Malabar Prawn Curry", quantity: 1, price: 525 },
      { name: "Appam Basket", quantity: 2, price: 170 },
      { name: "Kerala Parotta", quantity: 4, price: 65 },
      { name: "Tender Coconut Payasam", quantity: 1, price: 355 },
    ],
    timeline: [
      { label: "Order placed", time: "8:11 PM", complete: true },
      { label: "Prepared", time: "8:31 PM", complete: true },
      { label: "Picked up", time: "8:42 PM", complete: true },
      { label: "Delivered", time: "8:52 PM", complete: true },
    ],
  },
  {
    id: "ord-mithai-220",
    restaurantName: "Mithai Mahal",
    restaurantCuisine: "Sweets & Desserts",
    status: "Delivered",
    orderDate: "2026-03-13",
    timeLabel: "Delivered on 13 Mar",
    total: 812,
    itemCount: 3,
    deliveredAt: "Delivered in 32 min",
    deliveryAddress: "Flat 804, Palm Residency, Bandra West, Mumbai",
    paymentMethod: "Paid via Wallet",
    imageColor: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-700",
    items: [
      { name: "Kesar Rasmalai Box", quantity: 1, price: 289 },
      { name: "Motichoor Ladoo", quantity: 1, price: 199 },
      { name: "Kulfi Falooda", quantity: 2, price: 162 },
    ],
    timeline: [
      { label: "Order placed", time: "9:05 PM", complete: true },
      { label: "Prepared", time: "9:19 PM", complete: true },
      { label: "Picked up", time: "9:24 PM", complete: true },
      { label: "Delivered", time: "9:37 PM", complete: true },
    ],
  },
  {
    id: "ord-tandoor-673",
    restaurantName: "Tandoor Terrace",
    restaurantCuisine: "Mughlai & Kebabs",
    status: "Cancelled",
    orderDate: "2026-03-07",
    timeLabel: "Cancelled on 07 Mar",
    total: 920,
    itemCount: 3,
    deliveryAddress: "Flat 804, Palm Residency, Bandra West, Mumbai",
    paymentMethod: "Refunded to Card",
    imageColor: "bg-gradient-to-br from-yellow-700 via-orange-700 to-stone-900",
    items: [
      { name: "Chicken Seekh Kebab", quantity: 1, price: 329 },
      { name: "Butter Naan", quantity: 4, price: 55 },
      { name: "Dal Makhani", quantity: 1, price: 371 },
    ],
    timeline: [
      { label: "Order placed", time: "7:58 PM", complete: true },
      { label: "Kitchen accepted", time: "8:03 PM", complete: true },
      { label: "Restaurant delay flagged", time: "8:19 PM", complete: false },
      { label: "Order cancelled", time: "8:27 PM", complete: false },
    ],
  },
];

export const mockActiveOrder = mockOrders.find(
  (order) => order.status === "Preparing" || order.status === "Out for delivery",
);

export const mockPastOrders = mockOrders.filter(
  (order) => order.status === "Delivered" || order.status === "Cancelled",
);

export function getOrderById(orderId: string) {
  return mockOrders.find((order) => order.id === orderId);
}

export function getPaginatedPastOrders(page: number, pageSize = 4) {
  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(mockPastOrders.length / pageSize));
  const currentPage = Math.min(safePage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    currentPage,
    totalPages,
    orders: mockPastOrders.slice(startIndex, startIndex + pageSize),
  };
}

export function formatRupees(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface MockCartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  note?: string;
}

export interface MockCartAddon {
  id: string;
  name: string;
  price: number;
  tag: string;
}

export const mockCart = {
  restaurantName: "Saffron Courtyard",
  restaurantCuisine: "North Indian Signatures",
  deliveryTime: "25-35 min",
  deliveryAddress: "Flat 804, Palm Residency, Bandra West, Mumbai",
  imageColor: "bg-gradient-to-br from-orange-500 via-amber-500 to-red-700",
  offerLabel: "₹150 off applied on orders above ₹499",
  items: [
    {
      id: "cart-biryani",
      name: "Lucknowi Dum Biryani",
      quantity: 1,
      price: 449,
      note: "Medium spice, extra raita",
    },
    {
      id: "cart-kebab",
      name: "Galouti Kebab Platter",
      quantity: 1,
      price: 359,
    },
    {
      id: "cart-roti",
      name: "Roomali Roti",
      quantity: 2,
      price: 49,
    },
  ] satisfies MockCartItem[],
  addOns: [
    { id: "addon-kheer", name: "Zafrani Kheer", price: 129, tag: "Most added" },
    { id: "addon-lassi", name: "Sweet Lassi", price: 89, tag: "Cool down" },
    { id: "addon-rabdi", name: "Rabdi Kulfi", price: 149, tag: "Dessert" },
  ] satisfies MockCartAddon[],
  charges: {
    deliveryFee: 39,
    platformFee: 12,
    taxes: 86,
    discount: 150,
  },
};

export function getCartSubtotal() {
  return mockCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartTotal() {
  const subtotal = getCartSubtotal();

  return (
    subtotal +
    mockCart.charges.deliveryFee +
    mockCart.charges.platformFee +
    mockCart.charges.taxes -
    mockCart.charges.discount
  );
}
