/** Страница избранного */
"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";

interface ProductItem {
  id: number;
  img: string;
  name: string;
  description: string;
  basePrice: number;
  discountPercent: number;
  rating: { rate: number; count: number };
  tags: string[];
  weight: string;
  quantity: number;
}

export default function FavoritesPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserId(user.id);
      } catch {
        setUserId(null);
      }
    }
  }, []);

  const loadFavorites = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/favorites/products?startIdx=0&perPage=50&userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.products || []);
      }
    } catch (error) {
      console.error("Ошибка загрузки избранного:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const handleRemove = async (productId: number) => {
    if (!userId) return;
    
    setRemovingId(productId);
    
    try {
      const res = await fetch("/api/users/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId,
          action: "remove",
        }),
      });
      if (res.ok) {
        setTimeout(() => {
          setItems(prev => prev.filter(item => item.id !== productId));
          setRemovingId(null);
        }, 300);
      } else {
        setRemovingId(null);
      }
    } catch (error) {
      console.error("Ошибка удаления:", error);
      setRemovingId(null);
    }
  };

  if (!userId) {
    return (
      <div className="px-[max(12px,calc((100%-1208px)/2))] flex flex-col mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold text-main-text mb-4">Избранное</h1>
        <p className="text-gray-500">
          Чтобы просмотреть избранные товары, пожалуйста,{" "}
          <a href="/login" className="text-primary underline">
            войдите в аккаунт
          </a>
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-[max(12px,calc((100%-1208px)/2))] flex flex-col mx-auto py-20 text-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="px-[max(12px,calc((100%-1208px)/2))] flex flex-col mx-auto py-6 md:py-10">
      <h1 className="text-4xl md:text-5xl text-left font-bold text-main-text mb-8 md:mb-10">
        Избранное
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">В избранном пока нет товаров</p>
          <p className="mt-2">
            Перейдите в <a href="/catalog" className="text-primary underline">каталог</a>, чтобы добавить понравившиеся товары
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 xl:gap-10 justify-items-center">
          {items.map((product) => (
            <li 
              key={product.id}
              className={`relative transition-all duration-300 ${
                removingId === product.id 
                  ? "opacity-0 scale-75 -translate-x-full" 
                  : "opacity-100 scale-100 translate-x-0"
              }`}
            >
              <ProductCard {...product} userId={userId} onRemoveFromFavorites={() => handleRemove(product.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
