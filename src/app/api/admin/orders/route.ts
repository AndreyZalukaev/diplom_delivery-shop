import { NextResponse } from "next/server";
import pool from "@/lib/pg";
import { getServerUserId } from "@/utils/getServerUserId";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await pool.connect();
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ message: "Не авторизован" }, { status: 401 });
    }

    const userResult = await client.query("SELECT role FROM users WHERE id = $1", [userId]);
    const role = userResult.rows[0]?.role;

    if (role !== "admin" && role !== "manager") {
      return NextResponse.json({ message: "Нет доступа" }, { status: 403 });
    }

    // Начисляем бонусы для доставленных заказов
    const now = new Date();
    const pendingOrders = await client.query(
      `SELECT * FROM orders WHERE status NOT IN ('delivered', 'cancelled')`
    );

    for (const order of pendingOrders.rows) {
      const slotEnd = order.delivery_time_slot?.split("-")[1];
      if (order.delivery_date && slotEnd) {
        const [hours, minutes] = slotEnd.split(":").map(Number);
        const deliveryEnd = new Date(order.delivery_date);
        deliveryEnd.setHours(hours, minutes, 0, 0);

        if (now > deliveryEnd) {
          // Начисляем бонусы держателю карты
          const userCheck = await client.query(
            "SELECT has_card FROM users WHERE id = $1",
            [order.user_id]
          );
          if (userCheck.rows.length > 0 && userCheck.rows[0].has_card) {
            const earned = order.earned_bonuses || 0;
            if (earned > 0) {
              await client.query(
                "UPDATE users SET bonuses_count = bonuses_count + $1 WHERE id = $2",
                [earned, order.user_id]
              );
            }
          }
          // Меняем статус
          await client.query(
            "UPDATE orders SET status = 'delivered', updated_at = NOW() WHERE id = $1",
            [order.id]
          );
        }
      }
    }

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayAfterTomorrow = new Date(todayStart);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const dayAfterTomorrowStr = formatDate(dayAfterTomorrow);
    const todayStr = formatDate(todayStart);

    const result = await client.query(
      `SELECT * FROM orders
       WHERE delivery_date <= $1
       ORDER BY delivery_date DESC, delivery_time_slot ASC`,
      [dayAfterTomorrowStr]
    );

    const orders = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      orderNumber: row.order_number,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      totalAmount: parseFloat(row.total_amount) || 0,
      discountAmount: parseFloat(row.discount_amount) || 0,
      usedBonuses: row.used_bonuses || 0,
      earnedBonuses: row.earned_bonuses || 0,
      deliveryAddress:
        typeof row.delivery_address === "string"
          ? JSON.parse(row.delivery_address)
          : row.delivery_address,
      deliveryDate: row.delivery_date,
      deliveryTimeSlot: row.delivery_time_slot,
      surname: row.surname,
      name: row.name,
      phone: row.phone,
      gender: row.gender,
      birthday: row.birthday,
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const nextThreeDaysOrders = orders.filter(
      (order) =>
        order.deliveryDate >= todayStr &&
        order.deliveryDate <= dayAfterTomorrowStr
    ).length;

    return NextResponse.json({
      orders,
      stats: { nextThreeDaysOrders },
    });
  } catch (error) {
    console.error("Ошибка при загрузке заказов:", error);
    return NextResponse.json({ message: "Ошибка при загрузке заказов" }, { status: 500 });
  } finally {
    client.release();
  }
}
