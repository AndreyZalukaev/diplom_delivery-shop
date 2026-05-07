import { IOrder } from "@/types/order";
import UserAvatar from "./UserAvatar";
import { formatPhoneNumber } from "@/utils/orders/formatPhoneNumber";

const getOrderLabel = (order: IOrder): { label: string; color: string } => {
  // Отменён
  if (order.status === "cancelled") {
    return { label: "Отменён", color: "bg-red-100 text-red-800" };
  }

  // Проверяем, прошло ли время доставки
  const slotEnd = order.deliveryTimeSlot?.split("-")[1];
  if (order.deliveryDate && slotEnd) {
    const [hours, minutes] = slotEnd.split(":").map(Number);
    const deliveryEnd = new Date(order.deliveryDate);
    deliveryEnd.setHours(hours, minutes, 0, 0);
    
    if (new Date() > deliveryEnd) {
      return { label: "Доставлен", color: "bg-green-100 text-green-800" };
    }
  }

  // Способ оплаты
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

  return (
    <div className="flex flex-1 flex-wrap justify-between items-start text-[#414141] gap-5 border border-gray-100 rounded-xl p-4 bg-white">
      <div className="flex gap-x-4 items-center">
        <h2 className="text-base md:text-lg font-bold">
          №{order.orderNumber.slice(-3)}
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
      </div>
    </div>
  );
};

export default AdminOrderCard;
