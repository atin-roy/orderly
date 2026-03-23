export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisineType: string;
  imageUrl: string;
  rating: number;
  isApproved: boolean;
  ownerId: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}
