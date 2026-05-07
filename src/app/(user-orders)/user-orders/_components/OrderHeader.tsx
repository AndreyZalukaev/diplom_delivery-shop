"use client";

import { useState } from "react";
import { formatPrice } from "@/utils/formatPrice";
import { formatOrderDate } from "@/utils/orders/formatOrderDate";
import { IOrder } from "@/types/order";

interface OrderHeaderProps {
  order: IOrder;
  showDeliveryButton: boolean;
  onOrderClick: () => void;
  onDeliveryClick: () => void;
  disabled?: boolean;
  onOrderCancelled?: () => void;
}

const isDelivered = (order: IOrder): boolean => {
  const slotEnd = order.deliveryTimeSlot?.split("-")[1];
  if (!order.deliveryDate || !slotEnd) return false;
  const [hours, minutes] = slotEnd.split(":").map(Number);
  const deliveryEnd = new Date(order.deliveryDate);
  deliveryEnd.setHours(hours, minutes, 0, 0);
  return new Date() > deliveryEnd;
};

const OrderHeader = ({
  order,
  showDeliveryButton,
  onOrderClick,
  onDeliveryClick,
  disabled = false,
  onOrderCancelled,
}: OrderHeaderProps) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const delivered = isDelivered(order);
  const isCancelled = order.status === "cancelled";

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (res.ok) {
        setShowCancelModal(false);
        onOrderCancelled?.();
      }
    } catch {
      // ignore
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex flex-row text-sm lg:text-2xl gap-6 items-center">
          <p className="font-bold">{formatOrderDate(order.deliveryDate)}</p>
          <p className="font-bold hidden md:block">{order.deliveryTimeSlot}</p>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <p className="text-sm lg:text-2xl">{formatPrice(order.totalAmount)} ₽</p>

          {!isCancelled && !delivered && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="h-10 px-4 rounded text-red-600 bg-red-50 hover:bg-red-100 duration-300 cursor-pointer text-sm"
            >
              Отменить заказ
            </button>
          )}

          {!isCancelled && !showDeliveryButton && (
            <button
              onClick={onOrderClick}
              disabled={disabled}
              className={`h-10 px-6 rounded text-white duration-300 cursor-pointer text-sm font-medium ${
                disabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#ff6633] hover:shadow-lg"
              }`}
            >
              {disabled ? "Недоступно" : "Повторить"}
            </button>
          )}

          {!isCancelled && showDeliveryButton && (
            <button
              onClick={onDeliveryClick}
              className="bg-[#ff6633] text-white h-10 px-6 rounded duration-300 hover:shadow-lg cursor-pointer text-sm font-medium"
            >
              Когда доставить
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения отмены */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-[#414141] mb-2">Отменить заказ?</h3>
            <p className="text-gray-500 mb-2">Заказ №{order.orderNumber.slice(-3)}</p>
            <p className="text-gray-500 mb-6 text-sm">
              Отменить заказ можно только пока он не доставлен. После отмены восстановить заказ будет нельзя.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#f3f2f1] text-[#414141] hover:bg-gray-200 duration-300 cursor-pointer font-medium"
              >
                Оставить
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-6 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 duration-300 cursor-pointer font-medium disabled:opacity-50"
              >
                {cancelling ? "Отмена..." : "Отменить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderHeader;
