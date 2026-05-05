"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

interface CartContextType {
  cartItems: CartItem[];
  totalItems: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  updateCart: (items: CartItem[]) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  totalItems: 0,
  isLoading: false,
  fetchCart: async () => {},
  updateCart: () => {},
  clearCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
    // Очищаем корзину в БД
    fetch("/api/cart", { method: "DELETE" }).catch(() => {});
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, totalItems, isLoading, fetchCart, updateCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart должен использоваться внутри CartProvider");
  }
  return context;
}
