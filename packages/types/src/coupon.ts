export interface Coupon {
  id: number;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  available: boolean;
}

export interface AdminCoupon {
  id: number;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  enabled: boolean;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  title: string;
  message: string;
  discountAmount: number;
  minOrderAmount: number;
}
