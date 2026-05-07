"use client";

import ErrorComponent from "@/components/ErrorComponent";
import Loader from "@/components/Loader";
import { IOrder } from "@/types/order";
import { useEffect, useState, useCallback } from "react";
import UserOrdersList from "./_components/UserOrdersList";

const isOrderCompleted = (order: IOrder): boolean => {
  if (order.status === "cancelled") return true;
  const slotEnd = order.deliveryTimeSlot?.split("-")[1];
  if (!order.deliveryDate || !slotEnd) return false;
  const [hours, minutes] = slotEnd.split(":").map(Number);
  const deliveryEnd = new Date(order.deliveryDate);
  deliveryEnd.setHours(hours, minutes, 0, 0);
  return new Date() > deliveryEnd;
};

const UserOrdersPage = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    error: Error;
    userMessage: string;
  } | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Ошибка при загрузке заказов");
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      setError({
        error: err instanceof Error ? err : new Error("Неизвестная ошибка"),
        userMessage: "Ошибка получения заказов",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <Loader />;
  if (error) return <ErrorComponent error={error.error} userMessage={error.userMessage} />;

  if (orders.length === 0) {
    return (
      <div className="px-[max(12px,calc((100%-1208px)/2))] mx-auto py-8">
        <h1 className="mb-6 md:mb-8 xl:mb-10 text-4xl md:text-5xl xl:text-[64px] text-[#414141] font-bold">
          Заказы
        </h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Заказов пока нет</h2>
          <p className="text-gray-500 max-w-md">
            Здесь будут отображаться ваши заказы, когда Вы сделаете покупки в нашем магазине
          </p>
        </div>
      </div>
    );
  }

  const upcoming = orders.filter((o) => !isOrderCompleted(o));
  const completed = orders.filter((o) => isOrderCompleted(o));

  return (
    <div className="px-[max(12px,calc((100%-1208px)/2))] mx-auto py-8">
      <h1 className="mb-10 text-4xl md:text-5xl xl:text-[64px] text-[#414141] font-bold">
        Заказы
      </h1>

      {upcoming.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-[#414141] mb-6">Предстоящие</h2>
          <UserOrdersList orders={upcoming} onOrderCancelled={fetchOrders} />
        </>
      )}

      {completed.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-[#414141] mt-12 mb-6">
      <div className="border-t-2 border-gray-300 my-8"></div>
            Завершённые
          </h2>
          <UserOrdersList orders={completed} onOrderCancelled={fetchOrders} />
        </>
      )}
    </div>
  );
};

export default UserOrdersPage;
