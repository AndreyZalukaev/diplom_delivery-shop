"use client";

import { buttonStyles } from "@/app/(auth)/styles";
import { formatPrice } from "@/utils/formatPrice";
import Bonuses from "@/app/product/[id]/_components/Bonuses";
import { CartSummaryProps } from "@/types/cart";
import { useCart } from "@/contexts/CartContext";
import { getFullEnding } from "@/utils/getWordEnding";
import { CONFIG } from "@/config/config";
import { useState } from "react";
import { CartItemWithPrice } from "@/types/order";
import {
  calculateFinalPrice,
  calculatePriceByCard,
} from "@/utils/calcPrices";
import { createOrderAction } from "@/actions/orderDelivery";
import OrderSuccessMessage from "./OrderSuccessMessage";
import { ProductCardProps } from "@/types/product";

const CartSummary = ({
  visibleCartItems,
  totalMaxPrice,
  totalDiscount,
  finalPrice,
  totalBonuses,
  isMinimumReached,
  isCheckout = false,
  onCheckout,
  deliveryData,
  productsData = {},
  useBonuses = false,
  totalPrice = 0,
  setIsOrdered,
}: CartSummaryProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const { clearCart } = useCart();
  const [isOrdered, setIsOrderedLocal] = useState(false);

  const handleSetOrdered = (value: boolean) => {
    setIsOrderedLocal(value);
    if (setIsOrdered) setIsOrdered(value);
  };

  const handleCashPayment = async () => {
    if (!deliveryData) return;

    setIsProcessing(true);

    try {
      const cartItemsWithPrices: CartItemWithPrice[] = visibleCartItems.map(
        (item) => {
          const product = (productsData as { [key: string]: ProductCardProps })[item.productId];

          if (!product) {
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: 0,
            };
          }

          const priceWithDiscount = calculateFinalPrice(
            product.basePrice,
            product.discountPercent || 0
          );

          const finalPrice = CONFIG.CARD_DISCOUNT_PERCENT > 0
            ? calculatePriceByCard(
                priceWithDiscount,
                CONFIG.CARD_DISCOUNT_PERCENT
              )
            : priceWithDiscount;

          return {
            productId: item.productId,
            quantity: item.quantity,
            price: finalPrice,
            basePrice: product.basePrice,
            discountPercent: product.discountPercent || 0,
            hasLoyaltyDiscount: CONFIG.CARD_DISCOUNT_PERCENT > 0,
          };
        }
      );

      const result = await createOrderAction({
        finalPrice,
        totalBonuses,
        usedBonuses: Math.min(
          Math.floor((totalPrice * CONFIG.MAX_BONUSES_PERCENT) / 100),
          totalBonuses
        ),
        totalDiscount,
        deliveryAddress: deliveryData.address,
        deliveryTime: deliveryData.time,
        cartItems: cartItemsWithPrices,
        totalPrice: totalMaxPrice,
        paymentMethod: "cash_on_delivery",
      });

      setOrderNumber(result.orderNumber);
      handleSetOrdered(true);
    } catch (error: unknown) {
      console.error("Ошибка при создании заказа:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Произошла неизвестная ошибка";
      alert(`Ошибка при оформлении заказа: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = () => {
    console.log("Оплата на сайте");
  };

  const isFormValid = (): boolean => {
    if (!deliveryData) return false;
    const { address, time } = deliveryData;
    const isAddressValid = Boolean(
      address.city?.trim() && address.street?.trim() && address.house?.trim()
    );
    const isTimeValid = Boolean(time.date?.trim() && time.timeSlot?.trim());
    return isAddressValid && isTimeValid && isMinimumReached && visibleCartItems.length > 0;
  };

  const canProceedWithPayment = (): boolean => {
    return isFormValid() && !isProcessing;
  };

  const activeButton = `${buttonStyles.active} p-3 rounded mx-auto w-full text-2xl cursor-pointer`;
  const inactiveButton = `${buttonStyles.inactive} p-3 rounded mx-auto w-full text-2xl`;

  return (
    <>
      <div className="flex flex-col gap-y-2.5 pb-6 border-b-2 border-[#f3f2f1]">
        <div className="flex flex-row justify-between">
          <p className="text-[#8f8f8f]">
            {visibleCartItems.length} {`товар${getFullEnding(visibleCartItems.length)}`}
          </p>
          <p className="">{formatPrice(totalMaxPrice)} ₽</p>
        </div>

        <div className="flex flex-row justify-between">
          <p className="text-[#8f8f8f]">Скидка</p>
          <p className="text-[#ff6633] font-bold">
            -{formatPrice(totalDiscount)} ₽
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between gap-y-6">
        <div className="text-base text-[#8f8f8f] flex flex-row justify-between items-center w-full">
          <span>Итог:</span>
          <span className="font-bold text-2xl text-main-text">
            {formatPrice(finalPrice)} ₽
          </span>
        </div>
        <Bonuses bonus={totalBonuses} />
        <div className="w-full">
          {!isMinimumReached && (
            <div className="bg-[#d80000] rounded text-white text-xs text-center mx-auto py-0.75 px-1.5 mb-4 w-full">
              Минимальная сумма заказа 1000р
            </div>
          )}
          {!isCheckout ? (
            <button
              onClick={() => onCheckout?.(true)}
              disabled={!isMinimumReached || visibleCartItems.length === 0}
              className={
                isMinimumReached && visibleCartItems.length > 0
                  ? activeButton
                  : inactiveButton
              }
            >
              Оформить заказ
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              {!isOrdered ? (
                <>
                  <button
                    disabled={!canProceedWithPayment()}
                    onClick={handleOnlinePayment}
                    className={
                      canProceedWithPayment()
                        ? activeButton
                        : inactiveButton
                    }
                  >
                    {isProcessing ? "Обработка..." : "Оплатить на сайте"}
                  </button>

                  <button
                    disabled={!canProceedWithPayment()}
                    onClick={handleCashPayment}
                    className={`h-10 rounded w-full text-base items-center justify-center duration-300 ${
                      canProceedWithPayment()
                        ? "bg-[#ff6633] hover:shadow-[0_4px_12px_rgba(255,102,51,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isProcessing ? "Оформление..." : "Оплатить при получении"}
                  </button>
                </>
              ) : (
                <OrderSuccessMessage
                  orderNumber={orderNumber}
                  useBonuses={useBonuses}
                  totalBonuses={totalBonuses}
                  totalPrice={totalPrice}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSummary;
