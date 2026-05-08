"use client";

import Image from "next/image";
import Link from "next/link";
import { getBonusesWord } from "@/utils/bonusWord";

function getHasCard(): boolean {
  try {
    const match = document.cookie.match(/(?:^|;\s*)user=([^;]*)/);
    if (!match) return false;
    const user = JSON.parse(decodeURIComponent(match[1]));
    return user?.has_card === true;
  } catch {
    return false;
  }
}

const Bonuses = ({ bonus }: { bonus: number }) => {
  const roundedBonus = Math.round(bonus);
  const bonusWord = getBonusesWord(roundedBonus);
  const hasCard = getHasCard();

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

  return (
    <div className="w-[212px] flex flex-row gap-x-2 items-center justify-center mx-auto mb-2">
      <Image
        src="/icons-products/icon-green-smile.svg"
        alt="Бонусы"
        width={24}
        height={11}
      />
      <p className="text-xs text-primary">
        Вы получаете{" "}
        <span className="font-bold">
          {roundedBonus} {bonusWord}
        </span>
      </p>
    </div>
  );
};

export default Bonuses;
