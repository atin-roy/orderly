import { authRegister, authRegisterBusiness, authRegisterDelivery, type AuthResponseData } from "@/lib/api";

export type SignupRole = "customer" | "business" | "delivery";

export interface CustomerSignupPayload {
  email: string;
  password: string;
  phone: string;
}

export interface BusinessSignupPayload {
  ownerName: string;
  businessName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  serviceArea: string;
  businessType: string;
  cuisineFocus: string;
}

export interface DeliverySignupPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  vehicleType: string;
  preferredShift: string;
  serviceZones: string;
  deliveryExperience: string;
}

export function normalizePhoneForApi(value: string): string {
  const trimmed = value.trim();
  const hasPlusPrefix = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (hasPlusPrefix) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  return digits;
}

export function validateIndianPhone(value: string): string | null {
  const normalized = normalizePhoneForApi(value);
  const digits = normalized.replace(/\D/g, "");

  if (!digits) {
    return "Phone number is required.";
  }

  if (digits.length === 10) {
    return null;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return null;
  }

  return "Enter a valid Indian mobile number.";
}

export async function registerCustomer(
  payload: CustomerSignupPayload
): Promise<AuthResponseData> {
  return authRegister(payload.email, payload.password, normalizePhoneForApi(payload.phone));
}

export async function submitBusinessSignup(
  payload: BusinessSignupPayload
): Promise<AuthResponseData> {
  return authRegisterBusiness({
    ...payload,
    phone: normalizePhoneForApi(payload.phone),
  });
}

export async function submitDeliverySignup(
  payload: DeliverySignupPayload
): Promise<AuthResponseData> {
  return authRegisterDelivery({
    ...payload,
    phone: normalizePhoneForApi(payload.phone),
  });
}
