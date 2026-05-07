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

export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "collected" 
  | "delivery" 
  | "delivered" 
  | "cancelled" 
  | "refund" 
  | "returned" 
  | "failed";

export type PaymentStatus = "pending" | "waiting" | "paid" | "failed";

export interface IOrderItem {
  productId: string;
  quantity: number;
  price: number;
  discountPercent?: number;
  hasLoyaltyDiscount?: boolean;
}

export interface IOrder {
  id: number;
  userId: number;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  discountAmount: number;
  usedBonuses: number;
  earnedBonuses: number;
  deliveryAddress: DeliveryAddress;
  deliveryDate: string;
  deliveryTimeSlot: string;
  surname: string;
  name: string;
  phone: string;
  gender: string;
  birthday: string;
  items: IOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  finalPrice: number;
  totalBonuses: number;
  usedBonuses: number;
  totalDiscount: number;
  deliveryAddress: DeliveryAddress;
  deliveryTime: DeliveryTime;
  cartItems: CartItemWithPrice[];
  totalPrice: number;
  paymentMethod: "cash_on_delivery" | "online";
  paymentId?: string;
}

export interface UpdateUserAfterPaymentData {
  usedBonuses: number;
  earnedBonuses: number;
  purchasedProductIds: string[];
}
