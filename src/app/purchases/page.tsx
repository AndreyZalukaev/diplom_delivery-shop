import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import GenericListPage from "@/components/GenericListPage";
import Loader from "@/components/Loader";
import { getServerUserId } from "@/utils/getServerUserId";

interface PageProps {
  searchParams: Promise<{ page?: string; itemsPerPage?: string }>;
}

async function PurchasesContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const itemsPerPage = parseInt(params.itemsPerPage || "4");

  const userId = await getServerUserId();

  if (!userId) {
    return (
      <div className="text-center py-12 text-gray-500">
        Пожалуйста, авторизуйтесь
      </div>
    );
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/purchases?userId=${userId}&page=${page}&limit=${itemsPerPage}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Ошибка загрузки");
  const data = await res.json();

  return (
    <GenericListPage
      items={data.products || []}
      totalCount={data.totalCount || 0}
      currentPage={page}
      basePath="purchases"
      title="Покупали раньше"
      contentType="products"
      renderItem={(product) => <ProductCard {...product} />}
    />
  );
}

export default async function AllUserPurchases({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loader />}>
      <PurchasesContent searchParams={searchParams} />
    </Suspense>
  );
}
