"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import iconToRight from "/public/icons-products/icon-arrow-right.svg";
import { TRANSLATIONS } from "@/utils/translations";

/** Компонент хлебных крошек (внутренний, требует useSearchParams) */
const BreadcrumbsContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/" || pathname === "/search") return null;

  const pathSegments = pathname.split("/").filter((segment) => segment !== "");
  const productDesc = searchParams.get("desc");
  const productCategory = searchParams.get("category");

  const breadcrumbs = pathSegments.map((segment, index) => {
    let href = "/" + pathSegments.slice(0, index + 1).join("/");
    let label = TRANSLATIONS[segment] || segment;

    if (segment === "product" && productCategory) {
      label = TRANSLATIONS[productCategory] || productCategory;
      href = `/category/${productCategory}`;
    }
    if (segment === "category") { href = "/catalog"; label = "Каталог"; }
    if (index === pathSegments.length - 1 && productDesc && pathSegments.includes("product")) {
      label = productDesc;
      href = `${href}?desc=${encodeURIComponent(productDesc)}`;
    }
    return { label, href, isLast: index === pathSegments.length - 1 };
  });

  breadcrumbs.unshift({ label: "Главная", href: "/", isLast: false });

  return (
    <nav className="px-[max(12px,calc((100%-1208px)/2))] my-6">
      <ol className="flex items-center gap-4 text-[8px] md:text-xs">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center gap-4">
            <div className={item.isLast ? "text-[#8f8f8f]" : "text-[#414141] hover:underline cursor-pointer"}>
              {item.isLast ? item.label : <Link href={item.href}>{item.label}</Link>}
            </div>
            {!item.isLast && (
              <Image src={iconToRight}
                alt={`Переход от ${item.label} к ${breadcrumbs[breadcrumbs.length - 1].label}`}
                width={24} height={24} sizes="24px" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/** Хлебные крошки с Suspense-обёрткой */
const Breadcrumbs = () => {
  return (
    <Suspense fallback={
      <div className="px-[max(12px,calc((100%-1208px)/2))] my-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <BreadcrumbsContent />
    </Suspense>
  );
};

export default Breadcrumbs;
