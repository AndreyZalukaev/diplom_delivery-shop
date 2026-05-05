import pool from "@/lib/pg";
import { CONFIG } from "@/config/config";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const userPurchasesLimit = url.searchParams.get("userPurchasesLimit");

    let page = parseInt(url.searchParams.get("page") || "1");
    let limit = parseInt(url.searchParams.get("limit") || CONFIG.ITEMS_PER_PAGE.toString());

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = CONFIG.ITEMS_PER_PAGE;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ products: [], totalCount: 0 });
    }

    const userResult = await pool.query(
      "SELECT purchases FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ products: [], totalCount: 0 });
    }

    const rawPurchases = userResult.rows[0].purchases;
    let productIds: number[] = [];

    if (Array.isArray(rawPurchases)) {
      productIds = rawPurchases.map(Number).filter(n => !isNaN(n));
    } else if (typeof rawPurchases === 'string') {
      productIds = rawPurchases
        .replace(/[{}]/g, '')
        .split(',')
        .map(Number)
        .filter(n => !isNaN(n));
    } else if (rawPurchases && typeof rawPurchases === 'object') {
      productIds = Object.values(rawPurchases).map(Number).filter(n => !isNaN(n));
    }

    if (productIds.length === 0) {
      return NextResponse.json({ products: [], totalCount: 0 });
    }

    const totalCount = productIds.length;

    if (userPurchasesLimit) {
      const rLimit = parseInt(userPurchasesLimit);
      const limitedIds = productIds.slice(0, rLimit);

      if (limitedIds.length === 0) {
        return NextResponse.json([]);
      }

      const productsResult = await pool.query(
        `SELECT
          id, img, name, description,
          base_price as "basePrice",
          discount_percent as "discountPercent",
          jsonb_build_object('rate', rating_rate, 'count', rating_count) as rating,
          tags, weight, quantity
        FROM products
        WHERE id = ANY($1::bigint[])`,
        [limitedIds]
      );

      const products = productsResult.rows.map((p: any) => ({
        ...p,
        rating: typeof p.rating === 'string' ? JSON.parse(p.rating) : p.rating
      }));

      return NextResponse.json(products);
    }

    const paginatedIds = productIds.slice(offset, offset + limit);

    if (paginatedIds.length === 0) {
      return NextResponse.json({ products: [], totalCount });
    }

    const productsResult = await pool.query(
      `SELECT
        id, img, name, description,
        base_price as "basePrice",
        discount_percent as "discountPercent",
        jsonb_build_object('rate', rating_rate, 'count', rating_count) as rating,
        tags, weight, quantity
      FROM products
      WHERE id = ANY($1::bigint[])`,
      [paginatedIds]
    );

    const products = productsResult.rows.map((p: any) => ({
      ...p,
      rating: typeof p.rating === 'string' ? JSON.parse(p.rating) : p.rating
    }));

    return NextResponse.json({ products, totalCount });
  } catch (error) {
    console.error("Ошибка сервера:", error);
    return NextResponse.json(
      { message: "Ошибка при загрузке купленных продуктов" },
      { status: 500 }
    );
  }
}
