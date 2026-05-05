import { NextResponse } from "next/server";
import pool from "@/lib/pg";
import { Schedule } from "@/types/deliverySchedule";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT schedule FROM delivery_slots LIMIT 1"
    );
    const schedule = result.rows[0]?.schedule || {};

    return NextResponse.json({ schedule });
  } catch {
    return NextResponse.json(
      { message: "Ошибка при загрузке графика доставки" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { schedule } = (await request.json()) as { schedule: Schedule };

    await pool.query(
      `UPDATE delivery_slots 
       SET schedule = $1, updated_at = NOW() 
       WHERE id = (SELECT id FROM delivery_slots LIMIT 1)`,
      [JSON.stringify(schedule || {})]
    );

    return NextResponse.json({
      success: true,
      message: "График доставки сохранен",
    });
  } catch {
    return NextResponse.json(
      { message: "Ошибка при сохранении графика доставки" },
      { status: 500 }
    );
  }
}
