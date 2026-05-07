import { NextResponse } from "next/server";

// Дефолтные слоты — всегда доступны
const DEFAULT_SLOTS: Record<string, boolean> = {
  "08:00-14:00": true,
  "14:00-18:00": true,
  "18:00-22:00": true,
};

const getThreeDays = () => {
  const dates: string[] = [];
  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (let i = 0; i < 3; i++) {
    const date = new Date(localToday);
    date.setDate(localToday.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
};

export async function GET() {
  const dates = getThreeDays();
  const schedule: Record<string, Record<string, boolean>> = {};

  dates.forEach((date) => {
    schedule[date] = { ...DEFAULT_SLOTS };
  });

  return NextResponse.json({ schedule });
}
