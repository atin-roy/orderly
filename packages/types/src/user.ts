export enum Role {
  CUSTOMER = "CUSTOMER",
  OWNER = "OWNER",
  DELIVERY = "DELIVERY",
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
