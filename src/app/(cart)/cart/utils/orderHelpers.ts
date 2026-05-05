import { CartItem } from "@/types/cart";
import { ProductCardProps } from "@/types/product";
import { CONFIG } from "@/config/config";
import { calculateFinalPrice, calculatePriceByCard } from "@/utils/calcPrices";
import { CartItemWithPrice } from "@/types/order";
import { createOrderAction } from "@/actions/orderDelivery";

export const prepareCartItemsWithPrices = (
  visibleCartItems: CartItem[],
  productsData: { [key: string]: ProductCardProps },
  hasLoyaltyCard: boolean
): CartItemWithPrice[] => {
  return visibleCartItems
    .map((item) => {
      const product = productsData[item.productId];

      if (!product) {
        console.warn(`Товар ${item.productId} не найден`);
        return null;
      }

      const priceWithDiscount = calculateFinalPrice(
        product.basePrice,
        product.discountPercent || 0
      );

      const finalPrice = hasLoyaltyCard
        ? calculatePriceByCard(priceWithDiscount, CONFIG.CARD_DISCOUNT_PERCENT)
        : priceWithDiscount;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: finalPrice,
        basePrice: product.basePrice,
        discountPercent: product.discountPercent || 0,
        hasLoyaltyDiscount: hasLoyaltyCard && CONFIG.CARD_DISCOUNT_PERCENT > 0,
      };
    })
    .filter((item): item is CartItemWithPrice => item !== null);
};

export const createOrderRequest = async (orderData: {
  finalPrice: number;
  totalBonuses: number;
  usedBonuses: number;
  totalDiscount: number;
  deliveryAddress: {
    city: string;
    street: string;
    house: string;
    apartment?: string;
    additional?: string;
  };
  deliveryTime: {
    date: string;
    timeSlot: string;
  };
  cartItems: CartItemWithPrice[];
  totalPrice: number;
  paymentMethod: "cash_on_delivery" | "online";
  paymentId?: string;
}) => {
  const result = await createOrderAction(orderData);

  if (!result.success) {
    throw new Error(result.error || "Ошибка создания заказа");
  }

  return result;
};

export const confirmOrderPayment = async (orderId: string) => {
  const res = await fetch("/api/orders/confirm-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Ошибка подтверждения платежа");
  }

  return await res.json();
};
