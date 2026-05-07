"use client";

import { useState, useCallback } from "react";
import { CONFIG } from "@/config/config";
import { IOrder } from "@/types/order";
import OrderCard from "./OrderCard";

const UserOrdersList = ({ orders, onOrderCancelled }: { orders: IOrder[]; onOrderCancelled?: () => void }) => {
  const [visibleOrdersCount, setVisibleOrdersCount] = useState<number>(
    CONFIG.ITEMS_PER_ORDERS_PAGE
  );
  const visibleOrders = orders.slice(0, visibleOrdersCount);
  const hasMoreOrders = orders.length > visibleOrdersCount;

  const handleShowMore = () => {
    setVisibleOrdersCount(
      (prevCount) => prevCount + CONFIG.ITEMS_PER_ORDERS_PAGE
    );
  };

  return (
    <div>
      <div className="space-y-30">
        {visibleOrders.map((order) => (
          <OrderCard key={order.id} order={order} onOrderCancelled={onOrderCancelled} />
        ))}
      </div>

      {hasMoreOrders && (
        <div className="flex justify-center mt-15">
          <button
            className="bg-[#f3f2f1] hover:shadow-button-secondary text-main-text w-50 h-10 px-2 flex justify-center items-center gap-2 rounded duration-300 cursor-pointer"
            onClick={handleShowMore}
          >
            Показать еще
          </button>
        </div>
      )}
    </div>
  );
};

export default UserOrdersList;
