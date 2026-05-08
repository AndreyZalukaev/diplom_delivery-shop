import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { cardNumber } = body;

    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      return NextResponse.json(
        { error: "Номер карты должен содержать 16 цифр" },
        { status: 400 }
      );
    }

    const cleanNumber = cardNumber.replace(/\s/g, "");
    const formatted = cleanNumber.replace(/(.{4})/g, "$1 ").trim();

    // Проверяем существование
    const existing = await client.query(
      "SELECT id FROM cards WHERE card_number = $1",
      [formatted]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "Карта с таким номером уже существует" },
        { status: 409 }
      );
    }

    // Получаем следующий order_number
    const maxOrder = await client.query("SELECT COALESCE(MAX(order_number), 0) + 1 AS next_order FROM cards");
    const nextOrder = maxOrder.rows[0].next_order;

    const result = await client.query(
      "INSERT INTO cards (card_number, order_number, is_active) VALUES ($1, $2, false) RETURNING *",
      [formatted, nextOrder]
    );

    return NextResponse.json({
      success: true,
      message: "Карта успешно добавлена",
      card: result.rows[0],
    });
  } catch (error) {
    console.error("Ошибка добавления карты:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
