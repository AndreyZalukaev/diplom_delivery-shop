"use client";

import { getFullEnding } from "@/utils/getWordEnding";
import { CONFIG } from "@/config/config";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const OrderSuccessMessage = ({
  orderNumber,
  useBonuses,
  totalBonuses,
  totalPrice,
}: {
  orderNumber: string | null;
  useBonuses: boolean;
  totalBonuses: number;
  totalPrice: number;
}) => {
  const router = useRouter();
  const { clearCart } = useCart();

  const maxBonusUse = Math.floor((totalPrice * CONFIG.MAX_BONUSES_PERCENT) / 100);
  const usedBonuses = Math.min(maxBonusUse, totalBonuses);

  const handleNewOrder = () => {
    clearCart();
    router.replace("/");
  };

  const baseStyles =
    "h-10 rounded w-full text-base items-center justify-center duration-300";

  return (
    <div className="text-center p-4 bg-[#e5ffde] text-[#008c49] rounded border border-[#ff6633]">
      <div className="font-bold text-lg mb-2">Заказ оформлен успешно!</div>
      <div className="mb-3">
        Номер вашего заказа: <strong>{orderNumber}</strong>
      </div>
      <div className="text-sm mb-3">
        Вы можете оплатить заказ при получении курьеру наличными или картой. С
        Вами свяжутся для подтверждения времени доставки.
      </div>
      {useBonuses && (
        <div className="text-sm mb-3 text-[#ff6633] flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          {usedBonuses} бонус
          {getFullEnding(usedBonuses)} будет списано после подтверждения оплаты
        </div>
      )}
      <div className="text-sm mb-3 text-[#ff6633] flex items-center justify-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        После доставки вам будет начислено {totalBonuses} бонус
        {getFullEnding(totalBonuses)}
      </div>
      <button
        onClick={handleNewOrder}
        className={`${baseStyles} bg-[#ff6633] hover:shadow-[0_4px_12px_rgba(255,102,51,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] text-white cursor-pointer duration-300`}
      >
        Вернуться на главную
      </button>
    </div>
  );
};

export default OrderSuccessMessage;
