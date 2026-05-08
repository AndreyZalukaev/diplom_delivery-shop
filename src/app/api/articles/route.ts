import { CONFIG } from "@/config/config";
import pool from "@/lib/pg";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  try {
    const url = new URL(request.url);
    const articleId = url.searchParams.get("id");
    const articlesLimit = url.searchParams.get("articlesLimit");
    const startIdx = parseInt(url.searchParams.get("startIdx") || "0");
    const perPage = parseInt(
      url.searchParams.get("perPage") || CONFIG.ITEMS_PER_PAGE_MAIN_ARTICLES.toString()
    );

    // Одна статья по id (для редактирования)
    if (articleId) {
      const result = await client.query("SELECT * FROM articles WHERE id = $1", [parseInt(articleId)]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Статья не найдена" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    }

    // Ограниченное количество (для главной)
    if (articlesLimit) {
      const limit = parseInt(articlesLimit);
      const result = await client.query(
        "SELECT id, img, title, text, created_at as \"createdAt\" FROM articles ORDER BY created_at DESC LIMIT $1",
        [limit]
      );
      return NextResponse.json(result.rows);
    }

    // Пагинированный список
    const countResult = await client.query("SELECT COUNT(*) FROM articles");
    const totalCount = parseInt(countResult.rows[0].count);
    const articlesResult = await client.query(
      "SELECT id, img, title, text, created_at as \"createdAt\" FROM articles ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [perPage, startIdx]
    );
    return NextResponse.json({ articles: articlesResult.rows, totalCount });
  } catch (error) {
    console.error("Ошибка сервера:", error);
    return NextResponse.json({ message: "Ошибка при загрузке статей" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { title, text, img } = body;
    if (!title || !text) {
      return NextResponse.json({ error: "Заголовок и текст обязательны" }, { status: 400 });
    }
    const result = await client.query(
      "INSERT INTO articles (title, text, img) VALUES ($1, $2, $3) RETURNING *",
      [title, text, img || "/images/articles/article-1.jpeg"]
    );
    return NextResponse.json({ success: true, article: result.rows[0] });
  } catch (error) {
    console.error("Ошибка создания статьи:", error);
    return NextResponse.json({ error: "Ошибка создания статьи" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { id, title, text, img } = body;
    if (!id || !title || !text) {
      return NextResponse.json({ error: "ID, заголовок и текст обязательны" }, { status: 400 });
    }
    await client.query(
      "UPDATE articles SET title = $1, text = $2, img = $3 WHERE id = $4",
      [title, text, img || "/images/articles/article-1.jpeg", id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка обновления статьи:", error);
    return NextResponse.json({ error: "Ошибка обновления статьи" }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "ID обязателен" }, { status: 400 });
    }
    await client.query("DELETE FROM articles WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления статьи:", error);
    return NextResponse.json({ error: "Ошибка удаления статьи" }, { status: 500 });
  } finally {
    client.release();
  }
}
