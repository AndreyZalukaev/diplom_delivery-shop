"use client";

import { CartSummaryProps } from "@/types/cart";
import { useCart } from "@/contexts/CartContext";
import { CONFIG } from "@/config/config";
import { useState } from "react";
import PriceSummary from "./PriceSummary";
import MinimumOrderWarning from "./MinimumOrderWarning";
import CheckoutButton from "./CheckoutButton";
import PaymentButtons from "./PaymentButtons";
import { FakePaymentData, PaymentSuccessData } from "@/types/payment";
import {
  confirmOrderPayment,
  createOrderRequest,
  prepareCartItemsWithPrices,
} from "../utils/orderHelpers";
import { updateUserAfterPaymentAction } from "@/actions/updateUserAfterPaymentAction";
import FakePaymentModal from "@/app/(payment)/FakePaymentModal";
import PaymentSuccessModal from "@/app/(payment)/PaymentSuccessModal";
import { useRouter } from "next/navigation";
import { CustomCartItem, CustomPricing } from "@/types/cart";
import { ProductCardProps } from "@/types/product";

interface ExtendedCartSummaryProps extends CartSummaryProps {
  isRepeatOrder?: boolean;
  customCartItems?: CustomCartItem[];
  customPricing?: CustomPricing;
  onOrderSuccess?: () => void;
}

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
  isRepeatOrder = false,
  customCartItems,
  customPricing,
  onOrderSuccess,
}: ExtendedCartSummaryProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<
    "cash_on_delivery" | "online" | null
  >(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<PaymentSuccessData | null>(null);
  const router = useRouter();

  const {
    hasLoyaltyCard,
    isOrdered,
    setIsOrdered: setContextIsOrdered,
    resetAfterOrder,
    clearCart,
  } = useCart();

  // Для повторного заказа: получаем hasLoyaltyCard из localStorage
  const getRepeatOrderLoyaltyCard = (): boolean => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.has_card || !!user.loyalty_card;
      } catch {}
    }
    return false;
  };

  const effectiveVisibleItems = isRepeatOrder && customCartItems ? customCartItems : visibleCartItems;
  const effectiveHasLoyaltyCard = isRepeatOrder ? getRepeatOrderLoyaltyCard() : hasLoyaltyCard;

  const currentTotalMaxPrice = isRepeatOrder && customPricing ? customPricing.totalMaxPrice : totalMaxPrice;
  const currentTotalDiscount = isRepeatOrder && customPricing ? customPricing.totalDiscount : totalDiscount;
  const currentFinalPrice = isRepeatOrder && customPricing ? customPricing.finalPrice : finalPrice;
  const currentTotalBonuses = isRepeatOrder && customPricing ? customPricing.totalBonuses : totalBonuses;
  const currentIsMinimumReached = isRepeatOrder && customPricing ? customPricing.isMinimumReached : isMinimumReached;

  const usedBonuses = Math.min(
    Math.floor((totalPrice * CONFIG.MAX_BONUSES_PERCENT) / 100),
    currentTotalBonuses
  );

  const actualUsedBonuses = useBonuses ? usedBonuses : 0;

  const createOrder = async (
    paymentMethod: "cash_on_delivery" | "online",
    paymentId?: string
  ) => {
    if (!deliveryData) {
      throw new Error("Данные доставки не заполнены");
    }

    const cartItemsWithPrices = prepareCartItemsWithPrices(
      effectiveVisibleItems,
      productsData as { [key: string]: ProductCardProps },
      effectiveHasLoyaltyCard
    );

    const orderData = {
      finalPrice: currentFinalPrice,
      totalBonuses: currentTotalBonuses,
      usedBonuses: actualUsedBonuses,
      totalDiscount: currentTotalDiscount,
      deliveryAddress: deliveryData.address,
      deliveryTime: deliveryData.time,
      cartItems: cartItemsWithPrices,
      totalPrice: currentTotalMaxPrice,
      paymentMethod,
      paymentId,
    };

    return await createOrderRequest(orderData);
  };

  const handlePaymentResult = async (
    paymentMethod: "cash_on_delivery" | "online",
    paymentData?: FakePaymentData
  ) => {
    if (!deliveryData) {
      console.error("Данные доставки не заполнены");
      return;
    }

    setIsProcessing(true);
    setPaymentType(paymentMethod === "online" ? "online" : "cash");

    try {
      if (paymentMethod === "online") {
        if (paymentData?.status === "succeeded") {
          await confirmOrderPayment(currentOrderId!);
          await updateUserAfterPaymentAction({
            usedBonuses: actualUsedBonuses,
            earnedBonuses: currentTotalBonuses,
            purchasedProductIds: effectiveVisibleItems.map((item: any) => item.productId),
          });
        }

        const successModalData: PaymentSuccessData = {
          orderNumber: orderNumber!,
          paymentId: paymentData!.id,
          amount: currentFinalPrice,
          cardLast4: paymentData!.cardLast4,
        };

        setSuccessData(successModalData);
        setShowSuccessModal(true);
      } else {
        const result = await createOrder(paymentMethod, paymentData?.id);
        setOrderNumber(result.orderNumber);
        setShowSuccessModal(true);
        setOrderNumber(result.orderNumber);
      }

      setContextIsOrdered(true);
      if (setIsOrdered) setIsOrdered(true);
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка при обработке заказа");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashPayment = async () => {
    await handlePaymentResult("cash_on_delivery");
  };

  const handleOnlinePayment = async () => {
    if (!deliveryData) {
      console.error("Данные доставки не заполнены");
      return;
    }

    setIsProcessing(true);

    try {
      if (currentOrderId && orderNumber) {
        setShowPaymentModal(true);
      } else {
        const result = await createOrder("online");
        setOrderNumber(result.orderNumber);
        setCurrentOrderId(String(result.order.id));
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      alert("Ошибка при создании заказа");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handlePaymentSuccess = async (paymentData: FakePaymentData) => {
    setShowPaymentModal(false);
    try {
      await handlePaymentResult("online", paymentData);
    } catch (error) {
      console.error("Ошибка обработки заказа:", error);
    }
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false);
    alert(`Ошибка оплаты: ${error}`);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    if (isRepeatOrder && onOrderSuccess) {
      onOrderSuccess();
    }
    if (!isRepeatOrder) {
      resetAfterOrder();
      clearCart();
    }
    router.push("/user-orders");
  };

  const isFormValid = (): boolean => {
    if (!deliveryData) return false;

    const { address, time } = deliveryData;

    const isAddressValid = Boolean(
      address.city?.trim() && address.street?.trim() && address.house?.trim()
    );

    const isTimeValid = Boolean(time.date?.trim() && time.timeSlot?.trim());

    return (
      isAddressValid &&
      isTimeValid &&
      currentIsMinimumReached &&
      effectiveVisibleItems.length > 0
    );
  };

  const canProceedWithPayment = (): boolean => {
    return isFormValid() && !isProcessing;
  };

  return (
    <>
      <PriceSummary
        visibleCartItems={effectiveVisibleItems}
        totalMaxPrice={currentTotalMaxPrice}
        totalDiscount={currentTotalDiscount}
        finalPrice={currentFinalPrice}
        totalBonuses={currentTotalBonuses}
      />

      <div className="w-full">
        <MinimumOrderWarning isMinimumReached={currentIsMinimumReached} />
        {isRepeatOrder || isCheckout ? (
          <PaymentButtons
            isOrdered={isOrdered}
            paymentType={paymentType}
            orderNumber={orderNumber}
            isProcessing={isProcessing}
            canProceedWithPayment={canProceedWithPayment()}
            onOnlinePayment={handleOnlinePayment}
            onCashPayment={handleCashPayment}
          />
        ) : (
          <CheckoutButton
            isCheckout={isCheckout}
            isMinimumReached={currentIsMinimumReached}
            visibleCartItemsCount={effectiveVisibleItems.length}
            onCheckout={() => onCheckout?.(true)}
          />
        )}
      </div>

      <FakePaymentModal
        amount={currentFinalPrice}
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        successData={successData}
      />
    </>
  );
};

export default CartSummary;
