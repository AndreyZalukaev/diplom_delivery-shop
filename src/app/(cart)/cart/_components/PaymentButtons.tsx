import { buttonStyles } from "@/app/(auth)/styles";
import OrderSuccessMessage from "./OrderSuccessMessage";

interface PaymentButtonsProps {
  isOrdered: boolean;
  paymentType: "cash" | "online" | null;
  orderNumber: string | null;
  isProcessing: boolean;
  canProceedWithPayment: boolean;
  onOnlinePayment: () => void;
  onCashPayment: () => void;
}

const PaymentButtons = ({
  isOrdered,
  paymentType,
  orderNumber,
  isProcessing,
  canProceedWithPayment,
  onOnlinePayment,
  onCashPayment,
}: PaymentButtonsProps) => {
  if (isOrdered && paymentType === "cash") {
    return <OrderSuccessMessage orderNumber={orderNumber} />;
  }

  if (isOrdered) return null;

  return (
    <div className="flex flex-col gap-3">
      <button
        disabled={!canProceedWithPayment}
        onClick={onOnlinePayment}
        className={`rounded w-full text-xl h-15 items-center justify-center cursor-pointer ${
          canProceedWithPayment ? buttonStyles.active : buttonStyles.inactive
        }`}
      >
        {isProcessing ? "Обработка..." : "Оплатить на сайте"}
      </button>

      <button
        disabled={!canProceedWithPayment}
        onClick={onCashPayment}
        className={`h-10 rounded w-full text-base items-center justify-center duration-300 cursor-pointer ${
          canProceedWithPayment
            ? "bg-[#ff6633] hover:shadow-[0_4px_12px_rgba(255,102,51,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isProcessing ? "Оформление..." : "Оплатить при получении"}
      </button>
    </div>
  );
};

export default PaymentButtons;
