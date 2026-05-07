import { IOrder } from "@/types/order";
import { formatDisplayDate } from "@/utils/orders/formatDisplayDate";

interface DateFilterButtonsProps {
  dates: string[];
  orders: IOrder[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const DateFilterButtons = ({
  dates,
  orders,
  selectedDate,
  onDateSelect,
}: DateFilterButtonsProps) => {
  const labelMap: Record<number, string> = {
    0: "Сегодня",
    1: "Завтра",
    2: "Послезавтра",
  };

  return (
    <div className="flex flex-wrap gap-4">
      {dates.map((date, index) => {
        const ordersCount = orders.filter(
          (order) => order.deliveryDate === date
        ).length;

        return (
          <button
            key={date}
            onClick={() => onDateSelect(date)}
            className={`p-4 min-w-[180px] h-[60px] rounded-xl duration-300 cursor-pointer text-base md:text-lg flex justify-between items-center gap-2 ${
              selectedDate === date
                ? "bg-[#ff6633] text-white"
                : "bg-[#f3f2f1] hover:shadow-md text-[#414141]"
            }`}
          >
            <span className="font-medium">{labelMap[index] || formatDisplayDate(new Date(date))}</span>
            <span className="w-7 h-7 text-xs bg-white text-[#ff6633] rounded-full flex justify-center items-center font-bold">
              {ordersCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default DateFilterButtons;
