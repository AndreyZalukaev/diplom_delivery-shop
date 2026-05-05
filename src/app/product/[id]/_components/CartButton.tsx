"use client";

import { addToCartAction } from "@/actions/addToCartActions";
import { removeMultipleOrderItemsAction, updateOrderItemQuantityAction } from "@/actions/orderActions";
import { useCart } from "@/contexts/CartContext";
import QuantitySelector from "@/app/(cart)/cart/_components/QuantitySelector";
import Tooltip from "@/app/(auth)/_components/Tooltip";
import Image from "next/image";
import { useState } from "react";

const CartButton = ({ productId }: { productId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState("");

  const { cartItems, updateCart, fetchCart } = useCart();

  const cartItem = cartItems.find((item) => item.productId === productId);
  const currentQuantity = cartItem?.quantity || 0;
  const isInCart = currentQuantity > 0;

  const showMessage = (message: string) => {
    setTooltipMessage(message);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);
  };

  const handleAddToCart = async () => {
    setIsLoading(true);
    setShowTooltip(false);

    try {
      const result = await addToCartAction(productId);
      if (result.message) {
        showMessage(result.message);
      }
      if (result.success) {
        await fetchCart();
      }
    } catch {
      showMessage("Ошибка при добавлении в корзину");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityUpdate = async (newQuantity: number) => {
    if (newQuantity < 0 || isLoading) return;
    setIsLoading(true);
    setShowTooltip(false);

    try {
      if (newQuantity === 0) {
        const updated = cartItems.filter((item) => item.productId !== productId);
        updateCart(updated);
        await removeMultipleOrderItemsAction([productId]);
      } else {
        const updated = cartItems.map((item) =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
        updateCart(updated);
        await updateOrderItemQuantityAction(productId, newQuantity);
      }
      await fetchCart();
    } catch (error) {
      console.error("Ошибка обновления количества:", error);
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  if (isInCart) {
    return (
      <div className="relative mt-4">
        {showTooltip && <Tooltip text={tooltipMessage} position="top" cardPosition={true} />}
        <QuantitySelector
          quantity={currentQuantity}
          isUpdating={isLoading}
          isOutOfStock={false}
          onDecrement={() => handleQuantityUpdate(currentQuantity - 1)}
          onIncrement={() => handleQuantityUpdate(currentQuantity + 1)}
          onProductCard={true}
        />
      </div>
    );
  }

  return (
    <div className="relative mt-4">
      {showTooltip && <Tooltip text={tooltipMessage} position="top" cardPosition={true} />}
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="h-10 md:h-15 w-full bg-[#ff6633] text-white text-base md:text-2xl p-4 flex justify-center items-center rounded hover:shadow-article active:shadow-button-active duration-300 cursor-pointer relative"
      >
        <Image
          src="/icons-products/icon-shopping-cart.svg"
          alt="Корзина"
          width={32}
          height={32}
          className="absolute left-4"
        />
        <p className="text-center">
          {isLoading ? "..." : "В корзину"}
        </p>
      </button>
    </div>
  );
};

export default CartButton;
