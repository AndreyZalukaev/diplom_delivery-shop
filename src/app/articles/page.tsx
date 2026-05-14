import Image from "next/image";
import { ArticleCardProps } from "@/types/articles";
import GenericListPage from "@/components/GenericListPage";

interface PageProps {
  searchParams: Promise<{ page?: string; itemsPerPage?: string }>;
}

/** Страница всех статей с пагинацией */
const AllArticles = async ({ searchParams }: PageProps) => {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const itemsPerPage = parseInt(params.itemsPerPage || "3");

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/articles?page=${page}&limit=${itemsPerPage}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Ошибка загрузки");
    const data = await res.json();

    const renderArticle = (article: ArticleCardProps) => (
      <article className="bg-white h-full flex flex-col rounded overflow-hidden shadow hover:shadow-lg duration-300">
        <div className="relative h-48 w-full">
          <Image src={article.img} alt={article.title} fill className="object-cover" />
        </div>
        <div className="p-4 flex-1 flex flex-col gap-y-2">
          <time className="text-xs text-gray-400">
            {new Date(article.createdAt).toLocaleDateString("ru-RU")}
          </time>
          <h3 className="text-[#414141] text-base font-bold xl:text-lg line-clamp-2">{article.title}</h3>
          <p className="text-[#414141] line-clamp-3 text-sm xl:text-base">{article.text}</p>
        </div>
      </article>
    );

    return (
      <GenericListPage
        items={data.articles || data}
        totalCount={data.totalCount || data.length}
        currentPage={page}
        basePath="/articles"
        title="Статьи"
        contentType="articles"
        renderItem={(article: ArticleCardProps) => renderArticle(article)}
      />
    );
  } catch {
    return <div className="text-red-500 text-center py-4">Не удалось загрузить статьи</div>;
  }
};

export default AllArticles;
