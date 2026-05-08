import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId и status обязательны" }, { status: 400 });
    }

    // Получаем заказ
    const orderResult = await client.query(
      "SELECT * FROM orders WHERE id = $1",
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    const order = orderResult.rows[0];

    // Предотвращаем повторное начисление
    if (order.status === "delivered" && status === "delivered") {
      return NextResponse.json({ error: "Заказ уже доставлен" }, { status: 409 });
    }

    // Если меняем на "delivered" — начисляем бонусы
    if (status === "delivered" && order.status !== "delivered") {
      const userResult = await client.query(
        "SELECT has_card, bonuses_count FROM users WHERE id = $1",
        [order.user_id]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        if (user.has_card) {
          const earned = order.earned_bonuses || 0;
          await client.query(
            "UPDATE users SET bonuses_count = bonuses_count + $1 WHERE id = $2",
            [earned, order.user_id]
          );
        }
      }
    }

    // Обновляем статус
    await client.query(
      "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
      [status, orderId]
    );

    return NextResponse.json({ success: true, message: `Статус изменён на ${status}` });
  } catch (error) {
    console.error("Ошибка смены статуса:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  } finally {
    client.release();
  }
}
