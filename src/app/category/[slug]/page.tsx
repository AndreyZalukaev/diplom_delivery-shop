import { Suspense } from "react";
import Loader from "@/components/Loader";
import ProductCard from "@/components/ProductCard";
import PaginationWrapper from "@/components/PaginationWrapper";
import { notFound } from "next/navigation";
import { fetchProductsByCategory } from "./fetchCategoryProducts";
import { CONFIG } from "@/config/config";
import FilterButtons from "./FilterButtons";
import FilterControls from "./FilterControls";
import PriceFilter from "./PriceFilter";
import DropFilter from "./DropFilter";
import { getServerUserId } from "@/utils/getServerUserId";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    itemsPerPage?: string;
    filter?: string | string[];
    inStock?: string;
    priceFrom?: string;
    priceTo?: string;
  }>;
}

async function getCategoryBySlug(slug: string) {
  const { query } = await import("@/utils/db");
  const result = await query(
    "SELECT id, title, slug FROM catalog WHERE slug = $1",
    [slug]
  );
  return result.rows[0] || null;
}


async function CategoryContent({ slug, searchParams }: { slug: string; searchParams: any }) {
  const category = await getCategoryBySlug(slug);
  const userId = await getServerUserId();
  console.log("CategoryContent: userId", userId);

  if (!category) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  let limit = resolvedSearchParams.itemsPerPage
    ? parseInt(resolvedSearchParams.itemsPerPage)
    : CONFIG.ITEMS_PER_PAGE_CATEGORY;

  if (isNaN(limit) || limit < 1) limit = CONFIG.ITEMS_PER_PAGE_CATEGORY;

  const inStock = resolvedSearchParams.inStock === "true";
  const priceFrom = resolvedSearchParams.priceFrom ? parseInt(resolvedSearchParams.priceFrom) : undefined;
  const priceTo = resolvedSearchParams.priceTo ? parseInt(resolvedSearchParams.priceTo) : undefined;

  let filters: string[] = [];
  if (resolvedSearchParams.filter) {
    filters = Array.isArray(resolvedSearchParams.filter)
      ? resolvedSearchParams.filter
      : [resolvedSearchParams.filter];
  }

  const { items, totalCount } = await fetchProductsByCategory(slug, {
    page,
    limit,
    inStock,
    priceFrom,
    priceTo,
    filters,
  });

  const basePath = `/category/${slug}`;

  return (
    <div className="flex flex-col w-full px-[max(12px,calc((100%-1208px)/2))] py-6 md:py-10">
      <h1 className="text-[36px] md:text-[48px] font-bold text-[#414141] mb-6 md:mb-8 xl:mb-10 max-w-[336px] md:max-w-none leading-[150%]">
        {category.title}
      </h1>

      <DropFilter basePath={basePath} category={slug} />

      <div className="flex flex-row gap-10 justify-between">
        <div className="hidden xl:block w-[272px] flex-shrink-0">
          <PriceFilter basePath={basePath} category={slug} />
        </div>

        <div className="flex-1 flex flex-col gap-y-6 md:gap-y-8 xl:gap-y-10">
          <div className="hidden xl:flex xl:flex-col xl:gap-y-6">
            <FilterButtons basePath={basePath} />
            <FilterControls basePath={basePath} />
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Товары не найдены
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 xl:gap-10 justify-items-center">
                {items.map((item) => (
                  <li key={item.id}>
                    <ProductCard {...item} userId={userId} />
                  </li>
                ))}
              </ul>

              {totalCount > limit && (
                <div className="mt-8">
                  <PaginationWrapper
                    totalItems={totalCount}
                    currentPage={page}
                    basePath={basePath}
                    contentType="category"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={<Loader />}>
      <CategoryContent slug={resolvedParams.slug} searchParams={searchParams} />
    </Suspense>
  );
}
