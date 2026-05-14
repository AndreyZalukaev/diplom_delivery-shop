import { ReactNode } from "react";
import PaginationWrapper from "@/components/PaginationWrapper";

interface GenericListPageProps {
  items: any[];
  totalCount: number;
  currentPage: number;
  basePath: string;
  title: string;
  contentType?: "products" | "articles" | "category";
  renderItem: (item: any) => ReactNode;
}

/** Универсальная страница списка с пагинацией */
const GenericListPage = ({ items, totalCount, currentPage, basePath, title, contentType = "products", renderItem }: GenericListPageProps) => {
  const getGridClasses = () => {
    if (contentType === "articles") return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 xl:gap-10";
    if (contentType === "category") return "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 xl:gap-10 justify-items-center";
    return "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 xl:gap-10 justify-items-center";
  };

  return (
    <section>
      <div className={`px-[max(12px,calc((100%-1208px)/2))] flex flex-col ${contentType !== "category" ? "mt-20" : ""}`}>
        <div className="mb-4 md:mb-8 xl:mb-10">
          <h2 className="text-2xl xl:text-4xl text-left font-bold text-[#414141]">{title}</h2>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Нет элементов для отображения</div>
        ) : (
          <>
            <ul className={getGridClasses()}>
              {items.map((item) => <li key={item.id}>{renderItem(item)}</li>)}
            </ul>
            {totalCount > 0 && (
              <PaginationWrapper totalItems={totalCount} currentPage={currentPage} basePath={basePath} contentType={contentType} />
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default GenericListPage;
