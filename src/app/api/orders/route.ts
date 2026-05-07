import { NextResponse } from "next/server";
import pool from "@/lib/pg";
import { getServerUserId } from "@/utils/getServerUserId";

export async function GET() {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
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
      deliveryAddress: typeof row.delivery_address === "string"
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

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Ошибка получения заказов:", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const userId = await getServerUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Пользователь не авторизован" },
        { status: 401 }
      );
    }

    const userResult = await pool.query(
      "SELECT name, phone, gender, birth_date FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Пользователь не найден" },
        { status: 404 }
      );
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
        user.name,
        user.name,
        user.phone,
        user.gender,
        user.birth_date,
        JSON.stringify(
          orderData.cartItems.map(
            (item: {
              productId: string;
              quantity: number;
              price: number;
              discountPercent?: number;
              hasLoyaltyDiscount?: boolean;
            }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: Math.round((item.price || 0) * 100) / 100,
              discountPercent: item.discountPercent,
              hasLoyaltyDiscount: item.hasLoyaltyDiscount,
            })
          )
        ),
      ]
    );

    return NextResponse.json({
      success: true,
      order: result.rows[0],
      orderNumber: orderNumber,
    });
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
