import { IOrder } from "@/types/order";

/** Уникальные города из заказов */
export const getUniqueCities = (orders: IOrder[]) => {
  const cities = new Set(
    orders.map((order) => order.deliveryAddress?.city).filter((city) => city && city !== "")
  );
  return ["Все города", ...cities];
};
