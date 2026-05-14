"use client";

import { useEffect, useState } from "react";
import ProductsSection from "@/components/ProductsSection";
import { ProductCardProps } from "@/types/product";

/** Блок "Новинки" на главной */
const NewProducts = () => {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNew = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products?tag=new&randomLimit=4");
        if (!response.ok) throw new Error("Ошибка загрузки");
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch {
        setError("Не удалось загрузить новинки");
      } finally {
        setLoading(false);
      }
    };
    fetchNew();
  }, []);

  if (loading) return <ProductsSection title="Новинки" products={[]} loading />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  return <ProductsSection title="Новинки" products={products} viewAllLink="/new" />;
};

export default NewProducts;
