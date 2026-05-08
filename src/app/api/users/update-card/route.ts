import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { userId, cardNumber } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID пользователя обязателен" },
        { status: 400 }
      );
    }

    // Проверяем существование пользователя
    const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [userId]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Удаление карты
    if (!cardNumber || cardNumber.length === 0) {
      // Деактивируем старую карту если была
      const oldUser = await client.query("SELECT loyalty_card FROM users WHERE id = $1", [userId]);
      if (oldUser.rows[0]?.loyalty_card) {
        await client.query(
          "UPDATE cards SET is_active = false, user_id = NULL, deactivated_at = NOW() WHERE card_number = $1",
          [oldUser.rows[0].loyalty_card]
        );
      }
      await client.query(
        "UPDATE users SET loyalty_card = NULL, has_card = false WHERE id = $1",
        [userId]
      );
      return NextResponse.json({ success: true, message: "Карта удалена" });
    }

    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.length !== 16) {
      return NextResponse.json(
        { error: "Номер карты должен содержать 16 цифр" },
        { status: 400 }
      );
    }

    const formatted = cleanNumber.replace(/(.{4})/g, "$1 ").trim();

    // Проверяем, существует ли карта в таблице cards
    const cardCheck = await client.query(
      "SELECT id, is_active, user_id FROM cards WHERE card_number = $1",
      [formatted]
    );
    if (cardCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Карта с таким номером не найдена в системе" },
        { status: 404 }
      );
    }

    // Проверяем, не привязана ли карта другому пользователю
    const card = cardCheck.rows[0];
    if (card.user_id && card.user_id !== userId) {
      return NextResponse.json(
        { error: "Эта карта уже привязана к другому пользователю" },
        { status: 409 }
      );
    }

    // Проверяем, не привязана ли уже эта же карта к этому пользователю
    const currentUser = await client.query(
      "SELECT loyalty_card FROM users WHERE id = $1",
      [userId]
    );
    if (currentUser.rows[0]?.loyalty_card === formatted) {
      return NextResponse.json(
        { error: "Карта уже привязана к вашему аккаунту" },
        { status: 409 }
      );
    }

    // Обновляем пользователя
    await client.query(
      "UPDATE users SET loyalty_card = $1, has_card = true WHERE id = $2",
      [formatted, userId]
    );

    // Активируем карту и привязываем к пользователю
    await client.query(
      "UPDATE cards SET is_active = true, user_id = $1, activated_at = NOW() WHERE card_number = $2",
      [userId, formatted]
    );

    return NextResponse.json({
      success: true,
      message: "Карта успешно привязана и активирована",
      cardNumber: formatted,
    });
  } catch (error) {
    console.error("Ошибка обновления карты:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
