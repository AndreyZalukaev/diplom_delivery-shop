export interface DeliveryAddress {
  city: string;
  street: string;
  house: string;
  apartment: string;
  additional: string;
}

export interface DeliveryTime {
  date: string;
  timeSlot: string;
}

export interface CartItemWithPrice {
  productId: string;
  quantity: number;
  price: number;
  basePrice?: number;
  discountPercent?: number;
  hasLoyaltyDiscount?: boolean;
}

export type PaymentMethod = "cash_on_delivery" | "online";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export type PaymentStatus = "pending" | "waiting" | "paid";
