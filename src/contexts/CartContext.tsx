"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

interface PricingState {
  totalPrice: number;
  totalMaxPrice: number;
  totalDiscount: number;
  finalPrice: number;
  maxBonusUse: number;
  totalBonuses: number;
  isMinimumReached: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  updateCart: (items: CartItem[]) => void;
  clearCart: () => void;
  pricing: PricingState;
  updatePricing: (pricing: PricingState) => void;
  hasLoyaltyCard: boolean;
  setHasLoyaltyCard: (value: boolean) => void;
  useBonuses: boolean;
  setUseBonuses: (value: boolean) => void;
  isCheckout: boolean;
  setIsCheckout: (value: boolean) => void;
  isOrdered: boolean;
  setIsOrdered: (value: boolean) => void;
  resetAfterOrder: () => void;
}

const defaultPricing: PricingState = {
  totalPrice: 0, totalMaxPrice: 0, totalDiscount: 0,
  finalPrice: 0, maxBonusUse: 0, totalBonuses: 0, isMinimumReached: false,
};

const CartContext = createContext<CartContextType>({
  cartItems: [], totalItems: 0, isLoading: false,
  fetchCart: async () => {}, updateCart: () => {}, clearCart: () => {},
  pricing: defaultPricing, updatePricing: () => {},
  hasLoyaltyCard: false, setHasLoyaltyCard: () => {},
  useBonuses: false, setUseBonuses: () => {},
  isCheckout: false, setIsCheckout: () => {},
  isOrdered: false, setIsOrdered: () => {},
  resetAfterOrder: () => {},
});

/** Провайдер контекста корзины */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pricing, setPricing] = useState<PricingState>(defaultPricing);
  const [hasLoyaltyCard, setHasLoyaltyCard] = useState(false);
  const [useBonuses, setUseBonuses] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isOrdered, setIsOrdered] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");
      if (response.status === 401) return;
      if (!response.ok) throw new Error("Failed to fetch cart");
      const items: CartItem[] = await response.json();
      setCartItems(items);
      setTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCart = useCallback((items: CartItem[]) => {
    setCartItems(items);
    setTotalItems(items.reduce((sum, item) => sum + item.quantity, 0));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setTotalItems(0);
    fetch("/api/cart", { method: "DELETE" }).catch(() => {});
  }, []);

  const updatePricing = useCallback((pricing: PricingState) => {
    setPricing(pricing);
  }, []);

  const resetAfterOrder = useCallback(() => {
    setCartItems([]);
    setTotalItems(0);
    setIsCheckout(false);
    setIsOrdered(false);
    setUseBonuses(false);
    setPricing(defaultPricing);
  }, []);

  return (
    <CartContext.Provider
      value={{ cartItems, totalItems, isLoading, fetchCart, updateCart, clearCart,
        pricing, updatePricing, hasLoyaltyCard, setHasLoyaltyCard,
        useBonuses, setUseBonuses, isCheckout, setIsCheckout,
        isOrdered, setIsOrdered, resetAfterOrder }}
    >
      {children}
    </CartContext.Provider>
  );
}

/** Хук доступа к контексту корзины */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart должен использоваться внутри CartProvider");
  return context;
}
