"use client";

import { useEffect, useState } from "react";
import fetchPurchases from "@/app/purchases/fetchPurchases";
import ProductsSection from "@/components/ProductsSection";
import ErrorComponent from "@/components/ErrorComponent";
import { ProductCardProps } from "@/types/product";
import Loader from "@/components/Loader";
import { CONFIG } from "@/config/config";

/** Блок "Покупали раньше" на главной */
const Purchases = () => {
  const [shouldShow, setShouldShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [items, setItems] = useState<ProductCardProps[]>([]);

  useEffect(() => {
    const checkAccessAndFetchData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        let hasAccess = false;
        let userId: string | null = null;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            hasAccess = user.role === "user";
            userId = user.id ? String(user.id) : null;
          } catch { hasAccess = false; }
        }
        setShouldShow(hasAccess);
        if (hasAccess && userId) {
          const result = await fetchPurchases({ userPurchasesLimit: CONFIG.ITEMS_PER_PAGE_MAIN_PRODUCTS, userId });
          setItems(result.items);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    checkAccessAndFetchData();
  }, []);

  if (!shouldShow) return null;
  if (loading) return <Loader />;
  if (error) return <ErrorComponent error={error} userMessage="Не удалось загрузить Ваши покупки" />;

  return <ProductsSection title="Покупали раньше" viewAllButton={{ text: "Все покупки", href: "/purchases" }} products={items} />;
};

export default Purchases;
