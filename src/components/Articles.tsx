"use client";

import { useEffect, useState } from "react";
import ArticlesSection from "@/components/ArticlesSection";
import { ArticleCardProps } from "@/types/articles";

/** Блок "Статьи" на главной */
const Articles = () => {
  const [articles, setArticles] = useState<ArticleCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/articles");
        if (!response.ok) throw new Error("Ошибка загрузки");
        const data = await response.json();
        setArticles(data.articles || []);
      } catch {
        setError("Не удалось загрузить статьи");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <ArticlesSection title="Статьи" articles={[]} loading />;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  return <ArticlesSection title="Статьи" articles={articles} viewAllButton={{ text: "Смотреть все", href: "/articles" }} />;
};

export default Articles;
