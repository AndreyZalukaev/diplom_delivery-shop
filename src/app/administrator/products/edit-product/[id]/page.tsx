"use client";

import { initialProductData } from "@/constants/addProduct";
import { AddProductFormData } from "@/types/addProduct";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Title from "@/app/administrator/products/add-product/_components/Title";
import Article from "@/app/administrator/products/add-product/_components/Article";
import Description from "@/app/administrator/products/add-product/_components/Description";
import BasePrice from "@/app/administrator/products/add-product/_components/Baseprice";
import Discount from "@/app/administrator/products/add-product/_components/Discount";
import Quantity from "@/app/administrator/products/add-product/_components/Quantity";
import Weight from "@/app/administrator/products/add-product/_components/Weight";
import Brand from "@/app/administrator/products/add-product/_components/Brand";
import Manufacturer from "@/app/administrator/products/add-product/_components/Manufacturer";
import Categories from "@/app/administrator/products/add-product/_components/Categories";
import Tags from "@/app/administrator/products/add-product/_components/Tags";
import CheckboxGroup from "@/app/administrator/products/add-product/_components/CheckboxGroup";
import ImageUploadSection from "@/app/administrator/products/add-product/_components/ImageUploadSection";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<AddProductFormData>(initialProductData);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string>("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error("Ошибка загрузки товара");
      const product = await response.json();

      setFormData({
        title: product.name || "",
        description: product.description || "",
        basePrice: product.base_price?.toString() || "",
        discountPercent: product.discount_percent?.toString() || "",
        weight: product.weight?.toString() || "",
        quantity: product.quantity?.toString() || "",
        article: product.article?.toString() || "",
        brand: product.brand || "",
        manufacturer: product.manufacturer || "",
        isHealthyFood: product.is_healthy_food || false,
        isNonGMO: product.is_non_gmo || false,
        categories: product.categories || [],
        tags: product.tags || [],
      });
      setExistingImage(product.img || "");
    } catch (err) {
      alert("Ошибка загрузки товара");
      router.push("/administrator/products/products-list");
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (imageFile: File | null, productId: number) => {
    if (!imageFile) return null;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("imageId", productId.toString());
    try {
      const response = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await response.json();
      if (data.success) return data.product.img;
      return null;
    } finally {
      setUploading(false);
    }
  };

  const hasActionsTag = formData.tags.includes("actions");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (hasActionsTag && (!formData.discountPercent || formData.discountPercent === "0")) {
      alert("Для товара с тегом 'Акции' обязательно укажите размер скидки");
      return;
    }

    setUpdating(true);
    try {
      if (image && id) {
        await uploadImage(image, Number(id));
      }

      const response = await fetch("/api/update-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(id),
          name: formData.title,
          description: formData.description,
          basePrice: Number(formData.basePrice),
          discountPercent: Number(formData.discountPercent),
          weight: formData.weight,
          quantity: Number(formData.quantity),
          article: formData.article,
          brand: formData.brand,
          manufacturer: formData.manufacturer,
          isHealthyFood: formData.isHealthyFood,
          isNonGMO: formData.isNonGMO,
          tags: formData.tags,
        }),
      });

      if (response.ok) {
        alert("Товар успешно обновлён");
        router.push("/administrator/products/products-list");
      } else {
        const error = await response.json();
        alert(error.error || "Ошибка обновления товара");
      }
    } catch (error) {
      alert("Ошибка: " + (error instanceof Error ? error.message : "Неизвестная ошибка"));
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleImageChange = (file: File | null) => {
    setImage(file);
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="container flex flex-col items-center px-4 py-8 text-main-text mx-auto">
      <Link
        href="/administrator/products/products-list"
        className="hover:underline mb-3 lg:mb-4 flex flex-row items-center gap-3 text-sm lg:text-base"
      >
        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад к списку товаров
      </Link>
      <h1 className="text-3xl font-bold mb-8">Редактировать товар</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Title onChangeAction={handleInputChange} title={formData.title} />
          <Article onChangeAction={handleInputChange} article={formData.article} />
        </div>
        <Description onChangeAction={handleInputChange} description={formData.description} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BasePrice onChangeAction={handleInputChange} basePrice={formData.basePrice} />
          <Discount onChangeAction={handleInputChange} discount={formData.discountPercent} required={hasActionsTag} />
          <Quantity onChangeAction={handleInputChange} quantity={formData.quantity} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Weight onChangeAction={handleInputChange} weight={formData.weight} />
          <Brand onChangeAction={handleInputChange} brand={formData.brand} />
          <Manufacturer onChangeAction={handleInputChange} manufacturer={formData.manufacturer} />
        </div>
        <Categories selectedCategories={formData.categories} onCategoriesChange={(c) => setFormData((p) => ({ ...p, categories: c }))} />
        <Tags selectedTags={formData.tags} onTagsChange={handleTagsChange} hasActionsTag={hasActionsTag} />
        <CheckboxGroup
          items={[
            { name: "isHealthyFood", label: "Здоровая еда", checked: formData.isHealthyFood },
            { name: "isNonGMO", label: "Без ГМО", checked: formData.isNonGMO },
          ]}
          onChange={handleInputChange}
        />
        <ImageUploadSection onImageChange={handleImageChange} uploading={uploading} loading={updating} existingImage={existingImage} />
        <button
          type="submit"
          disabled={updating || uploading}
          className="w-full bg-primary hover:shadow-button-default active:shadow-button-active text-white py-3 px-4 mb-5 rounded disabled:opacity-50 cursor-pointer"
        >
          {updating ? "Сохранение..." : "Обновить товар"}
        </button>
      </form>
    </div>
  );
}
