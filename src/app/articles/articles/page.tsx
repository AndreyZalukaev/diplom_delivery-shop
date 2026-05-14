import { Suspense } from "react";
import fetchArticles from "@/app/articles/fetchArticles";
import GenericListPage from "@/components/GenericListPage";
import Loader from "@/components/Loader";
import ArticleCard from "@/app/articles/ArticleCard";

interface PageProps {
  searchParams: Promise<{ page?: string; itemsPerPage?: string }>;
}

/** Страница всех статей с пагинацией */
const AllArticles = async ({ searchParams }: PageProps) => {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page || '1', 10);
  const perPage = parseInt(resolvedParams.itemsPerPage || '12', 10);
  const startIdx = (page - 1) * perPage;

  const { items, totalCount } = await fetchArticles({ pagination: { startIdx, perPage } });

  return (
    <Suspense fallback={<Loader />}>
      <GenericListPage
        items={items}
        totalCount={totalCount}
        currentPage={page}
        basePath="/articles"
        title="Все статьи"
        contentType="articles"
        renderItem={(article) => <ArticleCard {...article} />}
      />
    </Suspense>
  );
};

export const metadata = {
  title: 'Статьи на сайте магазина "Северяночка"',
  description: 'Читайте статьи на сайте магазина "Северяночка"',
};

export default AllArticles;
