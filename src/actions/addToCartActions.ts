"use server";

import { query } from "@/utils/db";
import { getServerUserId } from "@/utils/getServerUserId";
import { CartItem } from "../types/cart";
import { calculateFinalPrice } from "@/utils/calcPrices";
import { CONFIG } from "@/config/config";

export async function addToCartAction(
  productId: string
): Promise<{ success: boolean; message: string; loyaltyPrice?: number }> {
  try {
    if (!productId) {
      return { success: false, message: "ID продукта не указан" };
    }

    const userId = await getServerUserId();

    if (!userId) {
      return { success: false, message: "Не авторизован" };
    }

    const userResult = await query(
      "SELECT id, cart, has_card FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return { success: false, message: "Пользователь не найден" };
    }

    const user = userResult.rows[0];

    const productResult = await query(
      "SELECT id, base_price, discount_percent, quantity FROM products WHERE id = $1",
      [parseInt(productId)]
    );

    if (productResult.rows.length === 0) {
      return { success: false, message: "Продукт не найден" };
    }

    const product = productResult.rows[0];

    const cartItems: CartItem[] = user.cart || [];

    const existingItem = cartItems.find(
      (item: CartItem) => String(item.productId) === String(productId)
    );

    if (existingItem) {
      return {
        success: false,
        message: "Товар уже в корзине",
      };
    }

    const productQuantity = product.quantity || 0;
    const initialQuantity = productQuantity > 0 ? 1 : 0;

    const newCartItem: CartItem = {
      productId,
      quantity: initialQuantity,
      addedAt: new Date(),
    };

    const newCartItems = [...cartItems, newCartItem];

    await query(
      "UPDATE users SET cart = $1 WHERE id = $2",
      [JSON.stringify(newCartItems), userId]
    );

    const finalPrice = calculateFinalPrice(
      product.base_price,
      product.discount_percent
    );

    let loyaltyPrice: number | undefined;

    if (user.has_card) {
      loyaltyPrice = finalPrice * (1 - CONFIG.CARD_DISCOUNT_PERCENT / 100);
    }

    return {
      success: true,
      message: "Товар добавлен в корзину",
      ...(loyaltyPrice !== undefined && { loyaltyPrice }),
    };
  } catch {
    return { success: false, message: "Ошибка сервера" };
  }
}
