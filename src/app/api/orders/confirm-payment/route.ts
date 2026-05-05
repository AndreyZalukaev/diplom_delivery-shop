import pool from "@/lib/pg";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "ID заказа обязателен" },
        { status: 400 }
      );
    }

    // Находим заказ
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Заказ не найден" },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];
    const items = order.items || [];

    // Списываем товары со склада
    for (const item of items) {
      await pool.query(
        "UPDATE products SET quantity = quantity - $1 WHERE id = $2::bigint AND quantity >= $1",
        [item.quantity, item.productId]
      );
    }

    // Обновляем статус заказа
    await pool.query(
      `UPDATE orders 
       SET status = 'confirmed', 
           payment_status = 'paid',
           updated_at = NOW()
       WHERE id = $1`,
      [orderId]
    );

    return NextResponse.json({ message: "Оплата подтверждена, товары списаны" });
  } catch (error) {
    console.error("Ошибка подтверждения платежа:", error);
    return NextResponse.json(
      { message: "Ошибка при подтверждении платежа" },
      { status: 500 }
    );
  }
}
