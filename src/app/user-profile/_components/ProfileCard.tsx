"use client";

import { useState } from "react";
import Link from "next/link";
import AlertMessage from "./AlertMessage";

interface ProfileCardProps {
  user: any;
  setUser: (user: any) => void;
}

const ProfileCard = ({ user, setUser }: ProfileCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDisplayCard = (card: string | null) => {
    if (!card) return "";
    const last4 = card.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    setCardNumber(value);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!cardNumber || cardNumber.length !== 16) {
      setError("Номер карты должен содержать 16 цифр");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/users/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          cardNumber: cardNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка сохранения карты");
      }

      const updatedUser = {
        ...user,
        loyalty_card: cardNumber,
        has_card: true,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=86400`;
      setUser(updatedUser);
      window.dispatchEvent(new Event("user-login"));

      setSuccess("Карта успешно привязана и активирована");
      setIsEditing(false);
      setCardNumber("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setShowDeleteModal(false);

    try {
      const response = await fetch("/api/users/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          cardNumber: "",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка удаления карты");
      }

      const updatedUser = {
        ...user,
        loyalty_card: null,
        has_card: false,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=86400`;
      setUser(updatedUser);
      window.dispatchEvent(new Event("user-login"));

      setSuccess("Карта удалена");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCardNumber("");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="border-t pt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#414141]">Карта лояльности</h2>
      </div>

      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="Введите 16 цифр карты"
            maxLength={16}
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-[#70c05b] focus:outline-none"
            disabled={isLoading}
          />
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading || cardNumber.length !== 16}
              className="px-6 py-2 bg-[#ff6633] text-white rounded-lg hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Сохранение..." : "Сохранить"}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : user?.loyalty_card ? (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500 mb-1">Привязана карта</p>
            <p className="text-lg font-semibold text-[#414141]">
              {formatDisplayCard(user.loyalty_card)}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            Удалить
          </button>
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">У вас ещё нет карты лояльности</p>
          <Link
            href="/loyalty-card"
            className="inline-block px-6 py-2 bg-[#ff6633] text-white rounded-lg hover:bg-[#e55a2e] transition-colors"
          >
            Оформить карту
          </Link>
        </div>
      )}

      {/* Модальное окно удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-[#414141] mb-2">Удаление карты</h3>
            <p className="text-gray-600 mb-2">
              Вы уверены, что хотите удалить привязанную карту?
            </p>
            <p className="text-sm text-gray-500 mb-4">
              После удаления бонусы перестанут начисляться при следующих покупках.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteCard}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
