import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/pg";

/** Сброс пароля по телефону — телефон в БД хранится в формате +7XXXXXXXXXX */
export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    let { phoneNumber, newPassword } = body;

    if (!phoneNumber || !newPassword) {
      return NextResponse.json(
        { error: "Телефон и пароль обязательны" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен содержать минимум 6 символов" },
        { status: 400 }
      );
    }

    // Приводим телефон к формату БД: +7XXXXXXXXXX
    const digits = phoneNumber.replace(/\D/g, "");
    const dbPhone = "+" + digits;

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const result = await client.query(
      `UPDATE users
       SET password_hash = $1
       WHERE phone = $2 AND phone_verified = true
       RETURNING id, phone`,
      [passwordHash, dbPhone]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Пользователь с таким номером не найден или телефон не верифицирован" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Пароль успешно обновлён" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
