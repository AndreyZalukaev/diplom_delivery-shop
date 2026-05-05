import { NextResponse } from "next/server";
import { query } from "@/utils/db";
import { getServerUserId } from "@/utils/getServerUserId";

export async function GET() {
  try {
    const userId = await getServerUserId();

    if (!userId) {
      return NextResponse.json([], { status: 401 });
    }

    const result = await query(
      "SELECT cart FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(result.rows[0].cart || []);
  } catch (error) {
    console.error("Error in cart API:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getServerUserId();

    if (!userId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    await query(
      "UPDATE users SET cart = '[]'::jsonb WHERE id = $1",
      [userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
