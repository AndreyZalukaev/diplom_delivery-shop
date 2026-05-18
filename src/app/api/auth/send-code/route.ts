import { NextRequest, NextResponse } from "next/server";
import { query } from "@/utils/db";

// Хранилище кодов в памяти (для dev-режима)
declare global { var __smsCodes: Record<string, { code: string; expires: number }> | undefined; }
globalThis.__smsCodes = globalThis.__smsCodes || {};

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 11) return NextResponse.json({ error: "Неверный телефон" }, { status: 400 });

    const code = String(Math.floor(1000 + Math.random() * 9000));
    globalThis.__smsCodes![cleanPhone] = { code, expires: Date.now() + 5 * 60 * 1000 };

    console.log(`\n=== SMS-КОД для ${phone}: ${code} ===\n`);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
