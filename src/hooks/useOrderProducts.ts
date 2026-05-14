import { useState, useEffect } from "react";
import { IOrder, IOrderItem } from "@/types/order";
import { ProductCardProps } from "@/types/product";

/** Хук получения данных товаров заказа с проверкой остатков */
export const useOrderProducts = (order: IOrder, productsData?: ProductCardProps[]) => {
  const [orderProducts, setOrderProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!productsData || productsData.length === 0) { setLoading(false); return; }
    const warnings: string[] = [];
    const mergedProducts = order.items
      .map((item: IOrderItem) => {
        const productData = productsData.find((p) => String(p.id) === String(item.productId));
        if (!productData) return null;
        const availableQuantity = productData.quantity;
        const orderQuantity = item.quantity;
        const isLowStock = availableQuantity < orderQuantity;
        const insufficientStock = availableQuantity === 0;
        if (isLowStock) {
          if (insufficientStock) {
            warnings.push(`Товар "${productData.name}" временно отсутствует на складе`);
          } else {
            warnings.push(`Товара "${productData.name}" осталось ${availableQuantity} шт., а в заказе ${orderQuantity} шт.`);
          }
        }
        return {
          ...productData,
          basePrice: item.price,
          discountPercent: item.discountPercent || 0,
          orderQuantity,
          isLowStock,
          insufficientStock,
        } as ProductCardProps;
      })
      .filter((p): p is ProductCardProps => p !== null);
    setOrderProducts(mergedProducts);
    setStockWarnings(warnings);
    setLoading(false);
  }, [order, productsData]);

  return { orderProducts, loading, stockWarnings };
};
