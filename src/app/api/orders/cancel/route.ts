import { NextResponse } from "next/server";
import pool from "@/lib/pg";
import { getServerUserId } from "@/utils/getServerUserId";

export async function PATCH(request: Request) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const { orderId } = await request.json();

    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ message: "Заказ не найден" }, { status: 404 });
    }

    const order = orderResult.rows[0];

    if (order.status === "cancelled" || order.status === "delivered") {
      return NextResponse.json(
        { message: "Заказ нельзя отменить" },
        { status: 400 }
      );
    }

    await pool.query(
      "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
      [orderId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка отмены заказа:", error);
    return NextResponse.json(
      { message: "Ошибка при отмене заказа" },
      { status: 500 }
    );
  }
}
