"use client";

import { addToCartAction } from "@/actions/addToCartActions";
import { removeMultipleOrderItemsAction, updateOrderItemQuantityAction } from "@/actions/orderActions";
import CartActionMessage from "@/components/CartActionMessage";
import { useCart } from "@/contexts/CartContext";
import QuantitySelector from "@/app/(cart)/cart/_components/QuantitySelector";
import Image from "next/image";
import { useState } from "react";

const CartButton = ({ productId }: { productId: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { cartItems, updateCart, fetchCart } = useCart();

  const cartItem = cartItems.find((item) => item.productId === productId);
  const currentQuantity = cartItem?.quantity || 0;
  const isInCart = currentQuantity > 0;

  const handleAddToCart = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await addToCartAction(productId);
      setMessage(result);
      if (result.success) {
        await fetchCart();
      }
    } catch {
      setMessage({
        success: false,
        message: "Ошибка при добавлении в корзину",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityUpdate = async (newQuantity: number) => {
    if (newQuantity < 0 || isLoading) return;
    setIsLoading(true);

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
      <QuantitySelector
        quantity={currentQuantity}
        isUpdating={isLoading}
        isOutOfStock={false}
        onDecrement={() => handleQuantityUpdate(currentQuantity - 1)}
        onIncrement={() => handleQuantityUpdate(currentQuantity + 1)}
        onProductCard={true}
      />
    );
  }

  return (
    <div className="relative mt-4">
      <form action={handleAddToCart}>
        <button
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
      </form>
      {message && (
        <CartActionMessage message={message} onClose={() => setMessage(null)} />
      )}
    </div>
  );
};

export default CartButton;
