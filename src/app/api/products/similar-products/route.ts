import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "4");

    if (!productId || !category) {
      return NextResponse.json(
        { message: "Не указаны параметры productId или category" },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT
          id,
          name,
          img,
          description,
          base_price as "basePrice",
          discount_percent as "discountPercent",
          jsonb_build_object('rate', rating_rate, 'count', rating_count) as rating,
          tags,
          quantity
        FROM products
        WHERE id != $1
          AND $2 = ANY(tags)
        ORDER BY RANDOM()
        LIMIT $3`,
        [parseInt(productId), category, limit]
      );

      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Ошибка при получении похожих товаров:", error);
    return NextResponse.json(
      { message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
