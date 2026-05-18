import { NextRequest, NextResponse } from "next/server";

declare global { var __smsCodes: Record<string, { code: string; expires: number }> | undefined; }

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();
    const cleanPhone = phone.replace(/\D/g, "");
    const stored = globalThis.__smsCodes?.[cleanPhone];

    if (!stored) return NextResponse.json({ error: "Код не найден" }, { status: 400 });
    if (Date.now() > stored.expires) return NextResponse.json({ error: "Код истёк" }, { status: 400 });
    if (stored.code !== code) return NextResponse.json({ error: "Неверный код" }, { status: 400 });

    delete globalThis.__smsCodes![cleanPhone];
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
