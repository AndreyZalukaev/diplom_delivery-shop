import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: "Неверный ID продукта" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT
          id, name, description,
          base_price as "basePrice",
          discount_percent as "discountPercent",
          jsonb_build_object('rate', rating_rate, 'count', rating_count) as rating,
          article, manufacturer, brand, country,
          img, weight, quantity, tags
        FROM products
        WHERE id = $1`,
        [productId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: "Продукт не найден" },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Ошибка при получении продукта:", error);
    return NextResponse.json(
      { message: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
