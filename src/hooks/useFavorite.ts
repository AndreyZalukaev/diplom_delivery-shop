"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFavoriteReturn {
  favorites: number[];
  isLoading: boolean;
  toggleFavorite: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;
}

/** Хук управления избранным */
export const useFavorite = (userId?: number | null): UseFavoriteReturn => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!userId) { setFavorites([]); return; }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/favorites?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const numericFavorites = (data.favorites || []).map((id: string | number) => Number(id));
          setFavorites(numericFavorites);
        }
      } catch (error) {
        console.error("Ошибка загрузки избранного:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, [userId]);

  const toggleFavorite = useCallback(async (productId: number) => {
    if (!userId) return;
    const isCurrentlyFavorite = favorites.includes(productId);
    const action = isCurrentlyFavorite ? "remove" : "add";
    try {
      const response = await fetch("/api/users/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, action }),
      });
      if (response.ok) {
        if (isCurrentlyFavorite) {
          setFavorites((prev) => prev.filter((id) => id !== productId));
        } else {
          setFavorites((prev) => [...prev, productId]);
        }
      }
    } catch (error) {
      console.error("Ошибка при переключении избранного:", error);
    }
  }, [userId, favorites]);

  const isFavorite = (productId: number) => favorites.includes(productId);

  return { favorites, isLoading, toggleFavorite, isFavorite };
};
