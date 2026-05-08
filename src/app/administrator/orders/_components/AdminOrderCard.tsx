"use client";

import { useState } from "react";
import { IOrder } from "@/types/order";
import UserAvatar from "./UserAvatar";
import { formatPhoneNumber } from "@/utils/orders/formatPhoneNumber";
import OrderProductsLoader from "./OrderProductsLoader";
import OrderDetails from "./OrderDetails";

const getOrderLabel = (order: IOrder): { label: string; color: string } => {
  if (order.status === "cancelled") {
    return { label: "Отменён", color: "bg-red-100 text-red-800" };
  }

  const slotEnd = order.deliveryTimeSlot?.split("-")[1];
  if (order.deliveryDate && slotEnd) {
    const [hours, minutes] = slotEnd.split(":").map(Number);
    const deliveryEnd = new Date(order.deliveryDate);
    deliveryEnd.setHours(hours, minutes, 0, 0);

    if (new Date() > deliveryEnd) {
      return { label: "Доставлен", color: "bg-green-100 text-green-800" };
    }
  }

  if (order.paymentMethod === "cash_on_delivery") {
    return { label: "Оплата при получении", color: "bg-blue-100 text-blue-800" };
  }
  if (order.paymentMethod === "online" && order.paymentStatus === "paid") {
    return { label: "Оплачен", color: "bg-green-100 text-green-800" };
  }

  return { label: "Оплата при получении", color: "bg-blue-100 text-blue-800" };
};

interface AdminOrderCardProps {
  order: IOrder;
}

const AdminOrderCard = ({ order }: AdminOrderCardProps) => {
  const { label, color } = getOrderLabel(order);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showFullOrder, setShowFullOrder] = useState(false);
  const [totalWeight, setTotalWeight] = useState(0);

  const handleToggleDetails = () => {
    if (showOrderDetails) {
      setShowOrderDetails(false);
      setShowFullOrder(false);
    } else {
      setShowOrderDetails(true);
      setShowFullOrder(false);
    }
  };

  const handleToggleFullOrder = () => {
    setShowFullOrder(!showFullOrder);
  };

  const orderItems = (order.items || []).map((item: any) => ({
    productId: String(item.productId),
    name: item.name || "",
    quantity: item.quantity || 1,
    price: item.price || 0,
    totalPrice: item.totalPrice || 0,
  }));

  return (
    <div className="flex flex-col border border-gray-100 rounded-xl bg-white overflow-hidden">
      {/* Основная строка */}
      <div className="flex flex-1 flex-wrap justify-between items-start text-[#414141] gap-5 p-4">
        <div className="flex gap-x-4 items-center">
          <h2 className="text-base md:text-lg font-bold">
            №{order.orderNumber?.slice(-3)}
          </h2>
          <div className="flex items-center gap-x-2">
            <UserAvatar
              userId={order.userId}
              gender={order.gender}
              name={order.name}
            />
            <span className="text-base md:text-lg">{order.name}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-5 items-center">
          <div className="flex items-center gap-2">
            <img
              alt="Телефон"
              src="/icons-orders/icon-phone.svg"
              width={24}
              height={24}
            />
            <span className="underline">{formatPhoneNumber(order.phone)}</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
            {label}
          </span>
          <button
            onClick={handleToggleDetails}
            className="px-4 py-2 text-sm font-medium text-[#414141] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showOrderDetails ? "Скрыть" : "Просмотреть"}
          </button>
        </div>
      </div>

      {/* Раскрытая часть — карточки товаров */}
      {showOrderDetails && orderItems.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <button
              onClick={handleToggleFullOrder}
              className="px-4 py-2 text-sm font-medium text-[#414141] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showFullOrder ? "Скрыть заказ" : "Показать заказ"}
            </button>
          </div>
          <OrderProductsLoader
            orderItems={orderItems.slice(0, showFullOrder ? orderItems.length : 4)}
            applyIndexStyles={false}
            onTotalWeightCalculated={setTotalWeight}
          />
        </div>
      )}

      {/* Полные детали заказа */}
      {showOrderDetails && showFullOrder && (
        <>
          {orderItems.length > 4 && (
            <div className="px-4 pb-4">
              <OrderProductsLoader
                orderItems={orderItems.slice(4)}
                applyIndexStyles={false}
              />
            </div>
          )}
          <OrderDetails order={order} totalWeight={totalWeight} />
        </>
      )}
    </div>
  );
};

export default AdminOrderCard;
