interface DeliveryInfoProps {
  delivery: {
    address: any;
    time: { date: string; timeSlot: string };
    isValid?: boolean;
  };
  onEdit: () => void;
}

const DeliveryInfo: React.FC<DeliveryInfoProps> = ({ delivery, onEdit }) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-main-text">
        <strong>Время доставки:</strong>{" "}
        {new Date(delivery.time.date).toLocaleDateString()}{" "}
        {delivery.time.timeSlot}
      </p>
      <button
        className="mt-2 text-main-text hover:underline text-sm cursor-pointer"
        onClick={onEdit}
      >
        Изменить время доставки
      </button>
    </div>
  );
};

export default DeliveryInfo;
