"use client";

import { useEffect, useState } from "react";
import { IOrder } from "@/types/order";
import { getUniqueCities } from "@/utils/orders/getUniqueCities";
import CityFilterButtons from "./CityFilterButtons";
import AdminOrderCard from "./AdminOrderCard";

interface TimeSlotGroupProps {
  timeSlot: string;
  slotOrders: IOrder[];
}

const TimeSlotGroup = ({ timeSlot, slotOrders }: TimeSlotGroupProps) => {
  const [selectedCity, setSelectedCity] = useState<string>("Все города");
  const [localOrders, setLocalOrders] = useState<IOrder[]>(slotOrders);

  useEffect(() => {
    setLocalOrders(slotOrders);
  }, [slotOrders]);

  const cities = getUniqueCities(slotOrders);

  const filteredSlotOrders =
    selectedCity === "Все города"
      ? localOrders
      : localOrders.filter(
          (order) => order.deliveryAddress?.city === selectedCity
        );

  const completedOrdersCount = filteredSlotOrders.filter(
    (order) => order.status === "confirmed"
  ).length;

  // Форматируем слот: 08:00-14:00 → 08:00 – 14:00
  const formattedSlot = timeSlot.replace("-", " – ");

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
  };

  return (
    <div>
      <div className="flex justify-between items-center text-xl md:text-2xl text-[#414141] mb-4">
        <div className="flex gap-x-4 items-center">
          <img
            alt="время"
            src="/icons-orders/icon-clock.svg"
            width={24}
            height={24}
          />
          <span className="font-bold">{formattedSlot}</span>
        </div>
        <div className="flex gap-x-2.5 items-center">
          <img
            alt="подтверждено"
            src="/icons-orders/icon-check.svg"
            width={24}
            height={24}
          />
          <span>
            <span className="text-2xl font-bold">{completedOrdersCount}</span>
            <span className="text-xl"> / </span>
            <span className="text-2xl">{filteredSlotOrders.length}</span>
          </span>
        </div>
      </div>

      {cities.length > 1 && (
        <CityFilterButtons
          cities={cities}
          slotOrders={slotOrders}
          selectedCity={selectedCity}
          onCitySelect={handleCitySelect}
        />
      )}

      <div className="flex flex-col gap-y-4">
        {filteredSlotOrders.map((order) => (
          <AdminOrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
};

export default TimeSlotGroup;
