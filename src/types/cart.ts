import { ProductCardProps } from "./product";
import { DeliveryAddressType, DeliveryTimeType } from "./order";

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface CartSummaryProps {
  visibleCartItems: CartItem[];
  totalMaxPrice: number;
  totalDiscount: number;
  finalPrice: number;
  totalBonuses: number;
  isMinimumReached: boolean;
  isCheckout?: boolean;
  onCheckout?: (value: boolean) => void;
  deliveryData?: {
    address: DeliveryAddressType;
    time: DeliveryTimeType;
    isValid: boolean;
  } | null;
  productsData?: { [key: string]: ProductCardProps };
  useBonuses?: boolean;
  totalPrice?: number;
  setIsOrdered?: (value: boolean) => void;
}

export interface CartItemProps {
  item: {
    productId: string;
    addedAt: Date;
    quantity: number;
  };
  productData: ProductCardProps | undefined;
  isSelected: boolean;
  onSelectionChange: (productId: string, isSelected: boolean) => void;
  onQuantityUpdate: (productId: string, newQuantity: number) => void;
  onRemove: (productId: string) => void;
  hasLoyaltyCard: boolean;
}

export interface OrderCartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
  hasLoyaltyDiscount: boolean;
}

export interface CartBaseProps {
  visibleCartItems: CartItem[];
  totalMaxPrice: number;
  totalDiscount: number;
  finalPrice: number;
  totalBonuses: number;
  isMinimumReached: boolean;
}

export interface BonusesSectionProps {
  bonusesCount: number;
  useBonuses: boolean;
  onUseBonusesChange: (use: boolean) => void;
  totalPrice: number;
}

export interface CartSidebarProps extends CartBaseProps, BonusesSectionProps {
  isCheckout?: boolean;
  onCheckout?: (value: boolean) => void;
  deliveryData?: {
    address: DeliveryAddressType;
    time: DeliveryTimeType;
    isValid: boolean;
  } | null;
  productsData?: { [key: string]: ProductCardProps };
  setIsOrdered?: (value: boolean) => void;
}

export interface CustomCartItem {
  productId: string;
  quantity: number;
  price: number;
  discountPercent: number;
  hasLoyaltyDiscount: boolean;
  addedAt: Date;
}

export interface CustomPricing {
  totalPrice: number;
  totalMaxPrice: number;
  totalDiscount: number;
  finalPrice: number;
  totalBonuses: number;
  maxBonusUse: number;
  isMinimumReached: boolean;
}
