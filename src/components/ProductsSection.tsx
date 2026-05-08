import ProductCard from "@/components/ProductCard";
import ViewAllButton from "@/components/ViewAllButton";

interface ProductsSectionProps {
  title: string;
  products: any[];
  viewAllLink?: string;
  viewAllButton?: { text: string; href: string };
  compact?: boolean;
  marginBottom?: number;
  applyIndexStyles?: boolean;
  loading?: boolean;
  contentType?: "products" | "category";
  isOrderPage?: boolean;
  isAdminOrderPage?: boolean;
}

const ProductsSection = ({
  title,
  products,
  viewAllLink,
  viewAllButton,
  compact = false,
  marginBottom = 0,
  applyIndexStyles = true,
  loading = false,
  contentType = "products",
  isOrderPage = false,
  isAdminOrderPage = false,
}: ProductsSectionProps) => {
  if (loading) {
    const skeletonCols = contentType === "category"
      ? "grid-cols-2 md:grid-cols-3"
      : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4";

    return (
      <section style={{ marginBottom: `${marginBottom}px` }}>
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        )}
        <div className={`grid ${skeletonCols} gap-4`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mt-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mt-2"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        {loading ? "" : "Товары не найдены"}
      </div>
    );
  }

  const displayProducts = compact ? products.slice(0, 4) : products;

  const getGridClasses = () => {
    if (contentType === "category") {
      return applyIndexStyles
        ? "grid-cols-2 md:grid-cols-3"
        : "grid-cols-2 md:grid-cols-4 xl:grid-cols-5";
    }
    return applyIndexStyles
      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      : "grid-cols-2 md:grid-cols-4 xl:grid-cols-5";
  };

  return (
    <section style={{ marginBottom: `${marginBottom}px` }}>
      {title && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          {viewAllLink && <ViewAllButton btnText="Смотреть все" href={viewAllLink} />}
          {viewAllButton && <ViewAllButton btnText={viewAllButton.text} href={viewAllButton.href} />}
        </div>
      )}
      <ul className={`grid gap-4 ${getGridClasses()}`}>
        {displayProducts.map((item) => (
          <li key={item.id}>
            <ProductCard {...item} isOrderPage={isOrderPage} isAdminOrderPage={isAdminOrderPage} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProductsSection;
