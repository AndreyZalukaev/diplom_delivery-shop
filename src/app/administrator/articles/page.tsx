import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import pool from "@/lib/pg";
import DeleteArticleButton from "./DeleteArticleButton";

async function getArticles() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM articles ORDER BY created_at DESC");
    return result.rows;
  } finally {
    client.release();
  }
}

export default async function AdminArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#414141]">Управление статьями</h1>
        <Link
          href="/administrator/articles/add"
          className="px-4 py-2 bg-[#ff6633] text-white rounded-lg hover:bg-[#e55a2e] transition-colors"
        >
          Добавить статью
        </Link>
      </div>

      <div className="grid gap-4">
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg bg-white"
          >
            <div className="relative w-full md:w-48 h-32 rounded overflow-hidden flex-shrink-0">
              <Image
                src={article.img}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-[#414141] line-clamp-1">{article.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(article.created_at).toLocaleDateString("ru-RU")}
              </p>
              <p className="text-sm text-[#414141] mt-2 line-clamp-2">{article.text}</p>
            </div>
            <div className="flex gap-2 items-start flex-shrink-0">
              <Link
                href={`/administrator/articles/edit/${article.id}`}
                className="px-3 py-1.5 text-sm bg-[#ff6633] text-white rounded hover:bg-[#e55a2e] transition-colors"
              >
                Редактировать
              </Link>
              <DeleteArticleButton articleId={article.id} articleTitle={article.title} />
            </div>
          </div>
        ))}
        {articles.length === 0 && (
          <p className="text-gray-500 text-center py-12">Статей пока нет</p>
        )}
      </div>
    </div>
  );
}
