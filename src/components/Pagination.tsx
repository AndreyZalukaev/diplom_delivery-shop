"use client";

import { PaginationProps } from "@/types/paginationProps";
import Link from "next/link";

const createPageUrl = (basePath: string, params: URLSearchParams, page: number) => {
  const newParams = new URLSearchParams(params);
  newParams.set("page", page.toString());
  return `${basePath}?${newParams.toString()}`;
};

const getVisiblePages = (totalPages: number, currentPage: number) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, currentPage + 2);
  if (currentPage <= 3) end = 5;
  else if (currentPage >= totalPages - 2) start = totalPages - 4;
  const pages: (number | string)[] = [];
  if (start > 1) pages.push(1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  if (end < totalPages) pages.push(totalPages);
  return pages;
};

/** Компонент пагинации */
const Pagination = ({ totalItems, currentPage, basePath, itemsPerPage, searchQuery }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const params = new URLSearchParams(searchQuery);
  const visiblePages = getVisiblePages(totalPages, currentPage);
  const buttonSize = "w-5 h-5 md:w-10 md:h-10 flex items-center justify-center rounded duration-300";
  const buttonActive = "bg-[#ff6633] text-white hover:bg-[#ff6633]";
  const buttonDisabled = "bg-[#fcd5ba] cursor-not-allowed pointer-events-none";
  const pageButtonClass = `border border-[#ff6633] ${buttonSize}`;

  const renderNavButton = (href: string, disabled: boolean, children: React.ReactNode) => {
    if (disabled) return <span className={`${buttonSize} ${buttonDisabled}`}>{children}</span>;
    return <Link href={href} className={`${buttonSize} ${buttonActive}`}>{children}</Link>;
  };

  return (
    <div className="flex justify-center mt-10 text-white text-sm md:text-base">
      <nav className="flex gap-1 md:gap-2 items-center">
        {renderNavButton(createPageUrl(basePath, params, 1), currentPage === 1, "«")}
        {renderNavButton(createPageUrl(basePath, params, currentPage - 1), currentPage === 1, "‹")}
        {visiblePages.map((page, index) => {
          if (page === "...") return <span key={`ellipsis-${index}`} className={`${buttonSize} text-[#ff6633]`}>...</span>;
          return (
            <Link key={page} href={createPageUrl(basePath, params, page as number)}
              className={`${pageButtonClass} ${currentPage === page ? "bg-[#ff6633] text-white border-transparent" : "text-[#ff6633] bg-white hover:bg-[#ff6633] hover:text-white hover:border-transparent"}`}>
              {page}
            </Link>
          );
        })}
        {renderNavButton(createPageUrl(basePath, params, currentPage + 1), currentPage === totalPages, "›")}
        {renderNavButton(createPageUrl(basePath, params, totalPages), currentPage === totalPages, "»")}
      </nav>
    </div>
  );
};

export default Pagination;
