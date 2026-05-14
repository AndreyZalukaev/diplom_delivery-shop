import { IOrder } from "@/types/order";

/** Текст статуса оплаты */
export const getPaymentStatusText = (paymentStatus: IOrder["paymentStatus"]): string => {
  switch (paymentStatus) {
    case "pending": return "Ожидает оплаты";
    case "waiting": return "Ожидание подтверждения";
    case "paid": return "Оплачен";
    case "failed": return "Ошибка оплаты";
    default: return paymentStatus;
  }
};
