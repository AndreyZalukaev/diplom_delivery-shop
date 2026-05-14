"use client";

import { useRouter } from "next/navigation";
import IconHeart from "@/components/svg/IconHeart";
import { useFavorite } from "@/hooks/useFavorite";
import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  productId: number;
  userId?: number | null;
  onToggle?: () => void;
}

/** Кнопка добавления/удаления из избранного */
const FavoriteButton = ({ productId: propProductId, userId: propUserId, onToggle }: FavoriteButtonProps) => {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(propUserId || null);
  const productId = typeof propProductId === 'string' ? parseInt(propProductId, 10) : propProductId;

  useEffect(() => {
    if (propUserId !== undefined) { setUserId(propUserId); return; }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { const user = JSON.parse(userStr); setUserId(user.id); }
      catch { setUserId(null); }
    }
  }, [propUserId]);

  const { toggleFavorite, isFavorite, isLoading, favorites } = useFavorite(userId);

  const handleClick = async () => {
    if (!userId) { router.push("/login"); return; }
    try {
      await toggleFavorite(productId);
      if (onToggle) onToggle();
    } catch (error) {
      console.error("Не удалось переключить избранное:", error);
    }
  };

  const isActive = userId ? favorites.includes(productId) : false;

  return (
    <button onClick={handleClick} disabled={isLoading}
      className={`w-8 h-8 p-2 bg-[#f3f2f1] hover:bg-[#fcd5ba] absolute top-2 right-2 rounded duration-300 z-10
        flex items-center justify-center ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
      title={isActive ? "Удалить из избранного" : "Добавить в избранное"}>
      <IconHeart isActive={isActive} />
    </button>
  );
};

export default FavoriteButton;
