import { CartSidebarProps } from "@/types/cart";
import BonusesSection from "./BonusesSection";
import CartSummary from "./CartSummary";

const CartSidebar = ({
  bonusesCount,
  useBonuses,
  onUseBonusesChange,
  totalPrice,
  visibleCartItems,
  totalMaxPrice,
  totalDiscount,
  finalPrice,
  totalBonuses,
  isMinimumReached,
  isCheckout = false,
  onCheckout,
  deliveryData,
  productsData,
  setIsOrdered,
}: CartSidebarProps) => {
  return (
    <div className="flex flex-col gap-y-6 md:w-[255px] xl:w-[272px]">
      <BonusesSection
        bonusesCount={bonusesCount}
        useBonuses={useBonuses}
        onUseBonusesChange={onUseBonusesChange}
        totalPrice={totalPrice}
      />

      <CartSummary
        visibleCartItems={visibleCartItems}
        totalMaxPrice={totalMaxPrice}
        totalDiscount={totalDiscount}
        finalPrice={finalPrice}
        totalBonuses={totalBonuses}
        isMinimumReached={isMinimumReached}
        isCheckout={isCheckout}
        onCheckout={onCheckout}
        deliveryData={deliveryData}
        productsData={productsData}
        useBonuses={useBonuses}
        totalPrice={totalPrice}
        setIsOrdered={setIsOrdered}
      />
    </div>
  );
};

export default CartSidebar;
