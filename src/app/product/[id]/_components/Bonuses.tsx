"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getBonusesWord } from "@/utils/bonusWord";

/** Чтение пользователя из localStorage (полные данные) */
function getUserFromStorage() {
  try {
    const data = localStorage.getItem("user");
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

const Bonuses = ({ bonus }: { bonus: number }) => {
  const roundedBonus = Math.round(bonus);
  const bonusWord = getBonusesWord(roundedBonus);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCard, setHasCard] = useState(false);
  const [mounted, setMounted] = useState(false);

  /** Обновление состояния из localStorage */
  const updateFromStorage = useCallback(() => {
    const user = getUserFromStorage();
    setIsAdmin(user?.role === "admin");
    setHasCard(user?.has_card === true);
    setMounted(true);
  }, []);

  useEffect(() => {
    updateFromStorage();
    // При обновлении данных пользователя перечитываем localStorage
    window.addEventListener("user-login", updateFromStorage);
    return () => window.removeEventListener("user-login", updateFromStorage);
  }, [updateFromStorage]);

  if (!mounted) return null;

  // Админ не видит блок бонусов
  if (isAdmin) return null;

  // Пользователь без карты — предложение получить карту
  if (!hasCard) {
    return (
      <div className="flex flex-col items-center gap-2 mx-auto mb-2">
        <div className="flex flex-row gap-x-2 items-center">
          <Image
            src="/icons-products/icon-green-smile.svg"
            alt="Бонусы"
            width={24}
            height={11}
          />
          <p className="text-xs text-gray-500">
            С картой лояльности вы бы получили{" "}
            <span className="font-bold text-[#414141]">
              {roundedBonus} {bonusWord}
            </span>
          </p>
        </div>
        <Link
          href="/loyalty-card"
          className="px-4 py-1.5 text-sm font-medium text-white bg-[#ff6633] rounded-lg hover:bg-[#e55a2e] transition-colors"
        >
          Получить карту
        </Link>
      </div>
    );
  }

  // Пользователь с картой — показывает начисляемые бонусы
  return (
    <div className="w-[212px] flex flex-row gap-x-2 items-center justify-center mx-auto mb-2">
      <Image
        src="/icons-products/icon-green-smile.svg"
        alt="Бонусы"
        width={24}
        height={11}
      />
      <p className="text-xs text-primary">
        Вы получите{" "}
        <span className="font-bold">
          {roundedBonus} {bonusWord}
        </span>
      </p>
    </div>
  );
};

export default Bonuses;
