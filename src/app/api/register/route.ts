import { NextResponse } from "next/server";
import { query } from "@/utils/db";
import bcrypt from "bcrypt";

/** Парсинг даты из ДД.ММ.ГГГГ в YYYY-MM-DD */
function parseBirthDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year) return null;
  if (isNaN(parseInt(day)) || isNaN(parseInt(month)) || isNaN(parseInt(year))) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

declare global { var __smsCodes: Record<string, { code: string; expires: number }> | undefined; }
globalThis.__smsCodes = globalThis.__smsCodes || {};

export async function POST(request: Request) {
  try {
    const { email, password, name, phone, birthDate, region, location, gender, loyaltyCard } = await request.json();

    // Приводим телефон к чистому формату +7XXXXXXXXXX
    const cleanPhone = phone.replace(/\D/g, "");
    const dbPhone = "+" + cleanPhone;

    // Проверка на существующего пользователя
    const existingUser = await query(`SELECT id FROM users WHERE phone = $1`, [dbPhone]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "Пользователь с таким телефоном уже существует" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const formattedBirthDate = birthDate ? parseBirthDate(birthDate) : null;
    // Пустая строка для email, если не передан (поле NOT NULL в БД)
    const userEmail = email || "";

    const result = await query(
      `INSERT INTO users (phone, name, email, password_hash, birth_date, region, location, gender, loyalty_card, created_at, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, true, false)
       RETURNING id`,
      [dbPhone, name, userEmail, hashedPassword, formattedBirthDate, region || "", location || "", gender || "", loyaltyCard || null]
    );

    // Генерируем SMS-код и сохраняем в памяти
    const code = String(Math.floor(1000 + Math.random() * 9000));
    globalThis.__smsCodes![cleanPhone] = { code, expires: Date.now() + 5 * 60 * 1000 };
    console.log(`\n=== SMS-КОД для ${dbPhone}: ${code} ===\n`);

    return NextResponse.json({ success: true, userId: result.rows[0].id, phone: dbPhone }, { status: 201 });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
  }
}
