/** Страница каталога */
import { Suspense } from "react";
"use client";

import { useEffect, useState } from "react";
import { CatalogProps } from "@/types/catalog";
import GridCategoryBlock from "@/components/GridCategoryBlock";
import ErrorComponent from "@/components/ErrorComponent";

const CatalogPage = () => {
  const [categories, setCategories] = useState<CatalogProps[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<CatalogProps | null>(null);
  const [overedCategoryId, setOveredCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ error: Error; userMessage: string } | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/catalog");
      if (!res.ok) throw new Error("Ошибка загрузки");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError({
        error: err instanceof Error ? err : new Error("Неизвестная ошибка"),
        userMessage: "Не удалось загрузить каталог категорий",
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleEditing = () => {
    if (isEditing) {
      updateOrderInDB();
    }
    setIsEditing(!isEditing);
  };

  const updateOrderInDB = async () => {
    try {
      const updatedData = categories.map((cat, index) => ({
        id: cat.id,
        order: index + 1,
        title: cat.title,
        img: cat.img,
      }));

      const res = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Ошибка обновления");
      const result = await res.json();
      if (result.success) {
        console.log("Порядок успешно обновлён");
      }
    } catch (err) {
      console.error("Ошибка при обновлении порядка:", err);
      setError({
        error: err instanceof Error ? err : new Error("Неизвестная ошибка"),
        userMessage: "Не удалось сохранить порядок категорий",
      });
    }
  };

  const resetLayout = async () => {
    await fetchCategories();
  };

  const handleDragStart = (category: CatalogProps) => {
    if (!isEditing) return;
    setDraggedCategory(category);
  };

  const handleDragOver = (e: React.DragEvent, categoryId: number) => {
    e.preventDefault();
    if (!isEditing || !draggedCategory) return;
    if (draggedCategory.id !== categoryId) {
      setOveredCategoryId(categoryId);
    }
  };

  const handleDragLeave = () => {
    setOveredCategoryId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!isEditing || !draggedCategory) return;

    const draggedId = draggedCategory.id;
    if (draggedId === targetId) {
      setDraggedCategory(null);
      setOveredCategoryId(null);
      return;
    }

    const newCategories = [...categories];
    const draggedIndex = newCategories.findIndex(c => c.id === draggedId);
    const targetIndex = newCategories.findIndex(c => c.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    [newCategories[draggedIndex], newCategories[targetIndex]] = [
      newCategories[targetIndex],
      newCategories[draggedIndex],
    ];

    setCategories(newCategories);
    setDraggedCategory(null);
    setOveredCategoryId(null);
  };

  if (loading) {
    return (
      <div className="px-[max(12px,calc((100%-1208px)/2))] py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Загрузка каталога...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-[max(12px,calc((100%-1208px)/2))] py-20">
        <ErrorComponent error={error.error} userMessage={error.userMessage} />
      </div>
    );
  }

  return (
    <div className="px-[max(12px,calc((100%-1208px)/2))] py-6 md:py-10">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl xl:text-4xl font-bold text-[#414141]">
          Каталог
        </h1>
        <div className="flex gap-3">
          {isEditing && (
            <button
              onClick={resetLayout}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              Сбросить
            </button>
          )}
          <button
            onClick={handleToggleEditing}
            className={`px-4 py-2 text-sm rounded transition ${
              isEditing
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {isEditing ? "Закончить редактирование" : "Изменить расположение"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 xl:gap-8">
        {categories.map((category, index) => (
          <GridCategoryBlock
            key={category.id}
            category={category}
            isEditing={isEditing}
            isDragging={draggedCategory?.id === category.id}
            isOvered={overedCategoryId === category.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            priority={index < 4}
          />
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;
