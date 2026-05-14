"use client";

import { useEffect, useState } from "react";
import ProductsSection from "@/components/ProductsSection";
import { ProductCardProps } from "@/types/product";

/** Блок "Акции" на главной */
const Actions = () => {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products?tag=actions&randomLimit=4");
        if (!response.ok) throw new Error("Ошибка загрузки");
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch {
        setError("Не удалось загрузить акции");
      } finally {
        setLoading(false);
      }
    };
    fetchActions();
  }, []);

  if (loading) return <ProductsSection title="Акции" products={[]} loading />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  return <ProductsSection title="Акции" products={products} viewAllLink="/actions" />;
};

export default Actions;
