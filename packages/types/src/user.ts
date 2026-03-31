export enum Role {
  USER = "USER",
  BUSINESS = "BUSINESS",
  DELIVERY_PARTNER = "DELIVERY_PARTNER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface UserAddress {
  id: number;
  label: string;
  address: string;
  buildingInfo: string | null;
  city: string | null;
  phone: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface UserProfile {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  phone: string;
  addresses: UserAddress[];
  createdDate: string;
}
