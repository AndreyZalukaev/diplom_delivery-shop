"use server";

import { OrderCartItem } from "@/types/cart";
import { query } from "@/utils/db";
import { getServerUserId } from "@/utils/getServerUserId";
import { revalidatePath } from "next/cache";

/** Получить корзину текущего пользователя */
export async function getOrderCartAction(): Promise<OrderCartItem[]> {
  try {
    const userId = await getServerUserId();
    if (!userId) return [];
    const result = await query("SELECT cart FROM users WHERE id = $1", [userId]);
    return result.rows[0]?.cart || [];
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
}

/** Получить бонусы и статус карты лояльности */
export async function getUserBonusesAction(): Promise<{ bonusesCount: number; hasLoyaltyCard: boolean }> {
  try {
    const userId = await getServerUserId();
    if (!userId) return { bonusesCount: 0, hasLoyaltyCard: false };
    const result = await query("SELECT bonuses_count, has_card FROM users WHERE id = $1", [userId]);
    return {
      bonusesCount: result.rows[0]?.bonuses_count || 0,
      hasLoyaltyCard: result.rows[0]?.has_card || false,
    };
  } catch (error) {
    console.error("Error getting bonuses:", error);
    return { bonusesCount: 0, hasLoyaltyCard: false };
  }
}

/** Обновить количество товара в корзине */
export async function updateOrderItemQuantityAction(
  productId: string, quantity: number
): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getServerUserId();
    if (!userId) return { success: false, message: "Не авторизован" };
    const userResult = await query("SELECT cart FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) return { success: false, message: "Пользователь не найден" };
    const cart: OrderCartItem[] = userResult.rows[0].cart || [];
    const itemIndex = cart.findIndex((item) => String(item.productId) === String(productId));
    if (itemIndex === -1) return { success: false, message: "Товар не найден в корзине" };
    cart[itemIndex].quantity = quantity;
    await query("UPDATE users SET cart = $1 WHERE id = $2", [JSON.stringify(cart), userId]);
    revalidatePath("/cart");
    return { success: true, message: "Количество обновлено" };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, message: "Ошибка сервера" };
  }
}

/** Удалить несколько товаров из корзины */
export async function removeMultipleOrderItemsAction(
  productIds: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getServerUserId();
    if (!userId) return { success: false, message: "Не авторизован" };
    const userResult = await query("SELECT cart FROM users WHERE id = $1", [userId]);
    if (userResult.rows.length === 0) return { success: false, message: "Пользователь не найден" };
    const cart: OrderCartItem[] = userResult.rows[0].cart || [];
    const updatedCart = cart.filter((item) => !productIds.includes(item.productId));
    await query("UPDATE users SET cart = $1 WHERE id = $2", [JSON.stringify(updatedCart), userId]);
    revalidatePath("/cart");
    return { success: true, message: "Товары удалены" };
  } catch (error) {
    console.error("Ошибка удаления продуктов:", error);
    return { success: false, message: "Ошибка сервера" };
  }
}
