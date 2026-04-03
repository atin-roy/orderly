export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrderAmount: number;
  available: boolean;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  title: string;
  message: string;
  discountAmount: number;
  minOrderAmount: number;
}
