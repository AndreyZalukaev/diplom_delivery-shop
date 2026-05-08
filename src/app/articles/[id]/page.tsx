import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import pool from "@/lib/pg";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getArticle(id: number) {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT * FROM articles WHERE id = $1", [id]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticle(parseInt(id));
  if (!article) return { title: "Статья не найдена" };
  return { title: article.title };
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const articleId = parseInt(id);
  if (isNaN(articleId)) notFound();

  const article = await getArticle(articleId);
  if (!article) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/articles" className="text-[#ff6633] hover:underline text-sm mb-4 inline-block">
        ← Все статьи
      </Link>
      <article>
        <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
          <Image
            src={article.img}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        <time className="text-sm text-gray-500">
          {new Date(article.created_at).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
        <h1 className="text-2xl md:text-4xl font-bold text-[#414141] mt-2 mb-6">
          {article.title}
        </h1>
        <div className="text-[#414141] text-base md:text-lg leading-relaxed whitespace-pre-line">
          {article.text}
        </div>
      </article>
    </div>
  );
}
