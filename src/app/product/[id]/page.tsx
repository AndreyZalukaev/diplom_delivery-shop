/** Страница товара */
import { notFound } from "next/navigation";
import { getServerUserId } from "@/utils/getServerUserId";
import { getServerUserRole } from "@/utils/getServerUserRole";
import { getReviewsWord } from "@/utils/reviewsWord";
import Bonuses from "./_components/Bonuses";
import CartButton from "./_components/CartButton";
import ImagesBlock from "./_components/ImagesBlock";
import ProductOffer from "./_components/ProductOffer";
import ShareButton from "./_components/ShareButton";
import AdditionalInfo from "./_components/AdditionalInfo";
import SimilarProducts from "./_components/SimilarProducts";
import SameBrandProducts from "./_components/SameBrandProducts";
import ReviewsWrapper from "./_components/ReviewsWrapper";
import StarRating from "@/components/StarRating";
import FavoriteButton from "@/components/FavoriteButton";
import AdminProductActions from "./_components/AdminProductActions";
import pool from "@/lib/pg";

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ desc?: string }>;
}

async function getProduct(id: number) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT
        id, name, description, base_price, discount_percent,
        rating_rate, rating_count, rating_distribution, article,
        manufacturer, brand, country,
        img, weight, quantity, tags
      FROM products
      WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}


export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(parseInt(id));
  if (!product) return { title: "Товар не найден" };
  return { title: product.name };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) notFound();

  const product = await getProduct(productId);
  const userId = await getServerUserId();
  const userRole = await getServerUserRole();

  if (!product) notFound();

  const discountPercent = product.discount_percent || 0;
  const discountedPrice = product.base_price * (1 - discountPercent / 100);
  const cardPrice = discountedPrice * (1 - (6 / 100));
  const bonusAmount = product.base_price * 0.05;
  const rating = product.rating_rate || 5.0;
  const reviewCount = product.rating_count || 0;
  const reviewWord = getReviewsWord(reviewCount);
  const firstCategory = product.tags?.[0] || "";

  const isAdmin = userRole === "admin" || userRole === "manager";

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <ImagesBlock product={product} />
        </div>

        <div className="lg:w-1/2 relative">
          <div className="absolute top-0 right-0">
            <FavoriteButton productId={productId} userId={userId} />
          </div>

          {product.article && (
            <p className="text-sm text-gray-500 mb-2">Арт. {product.article}</p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold mb-4 pr-12">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <StarRating rating={rating} />
            <span className="text-sm text-gray-600">
              {reviewCount} {reviewWord}
            </span>
          </div>
          <ProductOffer discountedPrice={discountedPrice} cardPrice={cardPrice} />
          <Bonuses bonus={bonusAmount} />
          {isAdmin ? (
            <AdminProductActions productId={productId} productName={product.name} />
          ) : (
            <CartButton productId={String(product.id)} />
          )}
          <ShareButton title={product.name} className="mt-4" />
          <AdditionalInfo
            brand={product.brand}
            manufacturer={product.manufacturer || product.country}
            weight={product.weight}
          />
          {product.description && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Описание</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}
        </div>
      </div>
      <ReviewsWrapper productId={productId} />
      {firstCategory && <SimilarProducts productId={productId} category={firstCategory} />}
      {product.brand && <SameBrandProducts brand={product.brand} productId={productId} />}
    </div>
  );
}
