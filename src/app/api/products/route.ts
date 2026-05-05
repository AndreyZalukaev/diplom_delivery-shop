import { query } from "@/utils/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tag = url.searchParams.get("tag");
    const randomLimit = url.searchParams.get("randomLimit");
    let page = parseInt(url.searchParams.get("page") || "1");
    let limit = parseInt(url.searchParams.get("limit") || "8");

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 8;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    if (!tag) {
      return NextResponse.json(
        { message: "Параметр tag обязателен" },
        { status: 400 }
      );
    }

    // Товары для главной (без рандома — ORDER BY id)
    if (randomLimit) {
      const rLimit = parseInt(randomLimit);
      const result = await query(
        `SELECT
          id, img, name, description,
          base_price as "basePrice",
          discount_percent as "discountPercent",
          jsonb_build_object('rate', rating_rate, 'count', rating_count) as rating,
          tags, weight, quantity
        FROM products
        WHERE $1 = ANY(tags) AND quantity > 0
        ORDER BY id
        LIMIT $2`,
        [tag, rLimit]
      );
      return NextResponse.json(result.rows);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM products
       WHERE $1 = ANY(tags) AND quantity > 0`,
      [tag]
    );
    const totalCount = parseInt(countResult.rows[0].total);

    const productsResult = await query(
      `SELECT
        id, img, name, description,
        base_price as "basePrice",
        discount_percent as "discountPercent",
        jsonb_build_object('rate', rating_rate, 'count', rating_count) as rating,
        tags, weight, quantity
      FROM products
      WHERE $1 = ANY(tags) AND quantity > 0
      ORDER BY id
      LIMIT $2 OFFSET $3`,
      [tag, limit, offset]
    );

    const products = productsResult.rows.map(p => ({
      ...p,
      rating: typeof p.rating === 'string' ? JSON.parse(p.rating) : p.rating
    }));

    return NextResponse.json({ products, totalCount });
  } catch (error) {
    console.error("Ошибка сервера:", error);
    return NextResponse.json(
      { message: "Ошибка при загрузке продуктов" },
      { status: 500 }
    );
  }
}
