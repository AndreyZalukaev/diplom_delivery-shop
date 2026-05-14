"use client";

import Image from "next/image";
import Link from "next/link";
import { CategoryBlockProps } from "@/types/categoryBlockProps";

/** Блок категории в сетке */
const GridCategoryBlock = ({ category, isEditing, isDragging, isOvered, onDragStart, onDragOver, onDragLeave, onDrop }: CategoryBlockProps) => {
  const getGridClasses = () => {
    const classes = [];
    if (category.mobileColSpan) classes.push(category.mobileColSpan);
    if (category.tabletColSpan) classes.push(category.tabletColSpan);
    if (category.colSpan) classes.push(category.colSpan);
    return classes.join(" ");
  };

  return (
    <div className={`relative group rounded-2xl overflow-hidden min-h-[200px] transition-all duration-300 ${getGridClasses()} ${
      isEditing ? "border-3 border-dashed border-gray-400" : ""
    } ${isDragging ? "opacity-50" : ""} ${isOvered ? "ring-4 ring-orange-500 bg-orange-100" : ""}`}
      draggable={isEditing}
      onDragStart={() => onDragStart(category)}
      onDragOver={(e) => onDragOver(e, category.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, category.id)}>
      <Link href={`/category/${category.slug}`} className="block w-full h-full">
        <div className="relative w-full h-full min-h-[200px]">
          <Image src={category.img} alt={category.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <span className="absolute bottom-4 left-4 text-white text-lg md:text-xl xl:text-2xl font-bold z-10">{category.title}</span>
        </div>
      </Link>
    </div>
  );
};

export default GridCategoryBlock;
