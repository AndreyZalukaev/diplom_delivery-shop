"use server";

import pool from "@/lib/pg";
import { getServerUserId } from "@/utils/getServerUserId";

export const createOrderAction = async (orderData: {
  deliveryAddress: {
    city: string;
    street: string;
    house: string;
    apartment?: string;
    additional?: string;
  };
  deliveryTime: {
    date: string;
    timeSlot: string;
  };
  cartItems: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  totalDiscount: number;
  finalPrice: number;
  totalBonuses: number;
  usedBonuses: number;
  paymentMethod: "cash_on_delivery" | "online";
}) => {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return { success: false, error: "Пользователь не авторизован" };
    }

    const userResult = await pool.query(
      "SELECT name, phone, gender, birth_date FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return { success: false, error: "Пользователь не найден" };
    }

    const user = userResult.rows[0];

    const roundedUsedBonuses = Math.floor(orderData.usedBonuses || 0);
    const roundedEarnedBonuses = Math.floor(orderData.totalBonuses || 0);
    const roundedTotalAmount = Math.round((orderData.finalPrice || 0) * 100) / 100;
    const roundedDiscountAmount = Math.round((orderData.totalDiscount || 0) * 100) / 100;

    const orderNumber = `${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;

    const result = await pool.query(
      `INSERT INTO orders (
        user_id, order_number, status, payment_method, payment_status,
        total_amount, discount_amount, used_bonuses, earned_bonuses,
        delivery_address, delivery_date, delivery_time_slot,
        surname, name, phone, gender, birthday, items
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        userId,
        orderNumber,
        "pending",
        orderData.paymentMethod,
        orderData.paymentMethod === "cash_on_delivery" ? "pending" : "waiting",
        roundedTotalAmount,
        roundedDiscountAmount,
        roundedUsedBonuses,
        roundedEarnedBonuses,
        JSON.stringify(orderData.deliveryAddress),
        orderData.deliveryTime.date,
        orderData.deliveryTime.timeSlot,
        user.name || "",
        user.name || "",
        user.phone || "",
        user.gender || "",
        user.birth_date || null,
        JSON.stringify(
          orderData.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Math.round((item.price || 0) * 100) / 100,
          }))
        ),
      ]
    );

    return {
      success: true,
      order: result.rows[0],
      orderNumber: orderNumber,
    };
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    return { success: false, error: "Внутренняя ошибка сервера" };
  }
};
