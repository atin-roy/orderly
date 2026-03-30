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
