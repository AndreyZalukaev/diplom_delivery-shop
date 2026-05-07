"use client";

import { useEffect, useState } from "react";
import { IOrder } from "@/types/order";
import Loader from "@/components/Loader";
import ErrorComponent from "@/components/ErrorComponent";
import AdminOrdersHeader from "./_components/AdminOrdersHeader";
import TimeSlotGroup from "./_components/TimeSlotGroup";

interface OrderStats {
  nextThreeDaysOrders: number;
}

type FilterPeriod = "all" | "week" | "month" | "date";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("all");
  const [customDate, setCustomDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    error: Error;
    userMessage: string;
  } | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) {
        throw new Error("Ошибка при загрузке заказов");
      }
      const data = await response.json();
      setOrders(data.orders);
      setStats(data.stats);
      // По умолчанию — все заказы
      setFilteredOrders(data.orders);
    } catch (err) {
      setError({
        error: err instanceof Error ? err : new Error("Неизвестная ошибка"),
        userMessage: "Не удалось загрузить заказы",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const applyFilter = (period: FilterPeriod, date?: string) => {
    setFilterPeriod(period);
    setCustomDate(date || "");

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    let filtered: IOrder[];

    switch (period) {
      case "all":
        filtered = orders;
        break;
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = formatDate(weekAgo);
        filtered = orders.filter((o) => o.deliveryDate >= weekAgoStr);
        break;
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthAgoStr = formatDate(monthAgo);
        filtered = orders.filter((o) => o.deliveryDate >= monthAgoStr);
        break;
      }
      case "date":
        if (date) {
          filtered = orders.filter((o) => o.deliveryDate === date);
        } else {
          filtered = orders;
        }
        break;
      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
  };

  const filterButtons = [
    { label: "Все", value: "all" as FilterPeriod },
    { label: "Неделя", value: "week" as FilterPeriod },
    { label: "Месяц", value: "month" as FilterPeriod },
  ];

  if (loading) return <Loader />;

  if (error) {
    return (
      <ErrorComponent error={error.error} userMessage={error.userMessage} />
    );
  }

  const timeSlots = Array.from(
    new Set(filteredOrders.map((order) => order.deliveryTimeSlot))
  ).sort();

  return (
    <div className="px-[max(12px,calc((100%-1208px)/2))] mx-auto mb-8 py-8">
      <AdminOrdersHeader stats={stats} />

      <div className="flex flex-wrap items-center gap-3 mb-10">
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => applyFilter(btn.value)}
            className={`px-5 py-2.5 h-10 rounded-lg duration-300 cursor-pointer text-sm font-medium ${
              filterPeriod === btn.value
                ? "bg-[#ff6633] text-white"
                : "bg-[#f3f2f1] hover:shadow-md text-[#414141]"
            }`}
          >
            {btn.label}
          </button>
        ))}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customDate}
            onChange={(e) => applyFilter("date", e.target.value)}
            className="px-3 py-2 h-10 rounded-lg border border-gray-200 text-sm text-[#414141] bg-white cursor-pointer focus:outline-none focus:border-[#ff6633]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-y-12">
        {timeSlots.map((timeSlot) => {
          const slotOrders = filteredOrders.filter(
            (order) => order.deliveryTimeSlot === timeSlot
          );
          return (
            <TimeSlotGroup
              key={timeSlot}
              timeSlot={timeSlot}
              slotOrders={slotOrders}
            />
          );
        })}
        {filteredOrders.length === 0 && (
          <p className="text-[#8f8f8f] text-lg">
            Нет заказов за выбранный период
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
