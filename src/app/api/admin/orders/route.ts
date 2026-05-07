import { NextResponse } from "next/server";
import pool from "@/lib/pg";
import { getServerUserId } from "@/utils/getServerUserId";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Не авторизован" },
        { status: 401 }
      );
    }

    const userResult = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );
    const role = userResult.rows[0]?.role;

    if (role !== "admin" && role !== "manager") {
      return NextResponse.json(
        { message: "Нет доступа" },
        { status: 403 }
      );
    }

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Послезавтра
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

    // Все заказы до послезавтра включительно (без нижней границы)
    const result = await pool.query(
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

    // Статистика на 3 дня
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
    return NextResponse.json(
      { message: "Ошибка при загрузке заказов" },
      { status: 500 }
    );
  }
}
