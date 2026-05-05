import { buttonStyles } from "@/app/(auth)/styles";

interface CheckoutButtonProps {
  isCheckout: boolean;
  isMinimumReached: boolean;
  visibleCartItemsCount: number;
  onCheckout: () => void;
}

const CheckoutButton = ({
  isCheckout,
  isMinimumReached,
  visibleCartItemsCount,
  onCheckout,
}: CheckoutButtonProps) => {
  if (isCheckout) return null;

  const isActive = isMinimumReached && visibleCartItemsCount > 0;

  return (
    <button
      onClick={onCheckout}
      disabled={!isActive}
      className={
        isActive
          ? `${buttonStyles.active} p-3 rounded mx-auto w-full text-2xl cursor-pointer`
          : `${buttonStyles.inactive} p-3 rounded mx-auto w-full text-2xl`
      }
    >
      Оформить заказ
    </button>
  );
};

export default CheckoutButton;
