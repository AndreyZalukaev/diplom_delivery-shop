import Image from "next/image";
import Link from "next/link";
import { ArticleCardProps } from "@/types/articles";
import ViewAllButton from "@/components/ViewAllButton";
import Loader from "@/components/Loader";

interface ArticlesSectionProps {
  title: string;
  articles: ArticleCardProps[];
  viewAllButton?: { text: string; href: string };
  loading?: boolean;
}

/** Секция со списком статей */
const ArticlesSection = ({ title, articles, viewAllButton, loading }: ArticlesSectionProps) => {
  if (loading) {
    return (
      <section>
        <div className="flex flex-col px-[max(12px,calc((100%-1208px)/2))]">
          <div className="mb-4 md:mb-8 xl:mb-10 flex flex-row justify-between">
            <h2 className="text-2xl xl:text-4xl text-left font-bold">{title}</h2>
          </div>
          <Loader />
        </div>
      </section>
    );
  }

  if (!articles.length) return null;

  return (
    <section>
      <div className="flex flex-col px-[max(12px,calc((100%-1208px)/2))]">
        <div className="mb-4 md:mb-8 xl:mb-10 flex flex-row justify-between">
          <h2 className="text-2xl xl:text-4xl text-left font-bold">{title}</h2>
          {viewAllButton && <ViewAllButton btnText={viewAllButton.text} href={viewAllButton.href} />}
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {articles.map((article) => (
            <li key={article.id} className="h-75 md:h-105">
              <article className="bg-white h-full flex flex-col rounded overflow-hidden shadow hover:shadow-lg duration-300">
                <div className="relative h-48 w-full">
                  <Image src={article.img} alt={article.title} fill className="object-cover" quality={100}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />
                </div>
                <div className="p-4 flex-1 flex flex-col gap-y-2">
                  <time className="text-xs text-gray-400">
                    {new Date(article.createdAt).toLocaleDateString("ru-RU")}
                  </time>
                  <h3 className="text-[#414141] text-base font-bold xl:text-lg line-clamp-2">{article.title}</h3>
                  <p className="text-[#414141] line-clamp-3 text-sm xl:text-base">{article.text}</p>
                  <Link href={`/articles/${article.id}`}
                    className="rounded mt-auto w-full sm:w-auto px-4 py-2 bg-[#E5FFDE] text-base text-[#70C05B] hover:bg-[#70C05B] hover:text-white transition-colors duration-300 cursor-pointer text-center">
                    Подробнее
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ArticlesSection;
