import { IOrder } from "@/types/order";

interface CityFilterButtonsProps {
  cities: string[];
  slotOrders: IOrder[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
}

const CityFilterButtons = ({
  cities,
  slotOrders,
  selectedCity,
  onCitySelect,
}: CityFilterButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2.5 mb-4">
      {cities.map((city) => {
        const ordersCount =
          city === "Все города"
            ? slotOrders.length
            : slotOrders.filter((order) => order.deliveryAddress?.city === city)
                .length;
        return (
          <button
            key={city}
            onClick={() => onCitySelect(city)}
            className={`px-3 py-2 h-10 rounded-lg duration-300 cursor-pointer text-sm flex justify-between items-center gap-2 ${
              selectedCity === city
                ? "bg-[#ff6633] text-white"
                : "bg-[#f3f2f1] hover:shadow-md text-[#414141]"
            }`}
          >
            <span>{city}</span>
            <span className="w-6 h-6 text-xs bg-[#ff6633] text-white rounded-full flex justify-center items-center font-bold">
              {ordersCount}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default CityFilterButtons;
