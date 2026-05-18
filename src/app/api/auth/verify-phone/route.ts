import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

/** Подтверждение телефона — установка phone_verified = true */
export async function PATCH(request: NextRequest) {
  const client = await pool.connect();
  try {
    const { phone } = await request.json();
    // Приводим к формату БД: +7XXXXXXXXXX
    const cleanPhone = phone.replace(/\D/g, "");
    const dbPhone = "+" + cleanPhone;

    if (cleanPhone.length < 11) {
      return NextResponse.json({ error: "Неверный телефон" }, { status: 400 });
    }

    const result = await client.query(
      "UPDATE users SET phone_verified = true WHERE phone = $1 RETURNING id, phone_verified",
      [dbPhone]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json({ success: true, phone_verified: true });
  } catch (error) {
    console.error("Ошибка verify-phone:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  } finally {
    client.release();
  }
}
