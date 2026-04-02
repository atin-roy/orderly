export interface Restaurant {
  id: number;
  ownerId: number;
  ownerName: string | null;
  name: string;
  slug: string;
  description: string;
  cuisineType: string;
  city: string;
  locality: string;
  imageUrl: string | null;
  rating: number;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  priceLevel: string;
  isApproved: boolean;
  isActive: boolean;
  imageColor: string;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  category: string;
  isAvailable: boolean;
  isVeg: boolean;
  sortOrder: number;
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}
