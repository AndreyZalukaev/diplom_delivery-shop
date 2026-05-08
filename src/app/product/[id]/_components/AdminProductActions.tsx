"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DeleteConfirmationModal } from "@/app/administrator/products/products-list/_components/DeleteConfirmationModal";

interface AdminProductActionsProps {
  productId: number;
  productName: string;
}

const AdminProductActions = ({ productId, productName }: AdminProductActionsProps) => {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/delete-product", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });
      if (res.ok) {
        setShowDeleteModal(false);
        router.push("/administrator/products");
      } else {
        alert("Ошибка при удалении");
      }
    } catch (err) {
      console.error("Ошибка удаления:", err);
      alert("Ошибка при удалении");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex gap-3 mt-4">
        <Link
          href={`/administrator/products/edit-product/${productId}`}
          className="flex-1 text-center px-6 py-3 text-base font-medium text-white bg-[#ff6633] rounded-lg hover:bg-[#e55a2e] transition-colors"
        >
          Редактировать
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex-1 px-6 py-3 text-base font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Удалить
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        productTitle={productName}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default AdminProductActions;
