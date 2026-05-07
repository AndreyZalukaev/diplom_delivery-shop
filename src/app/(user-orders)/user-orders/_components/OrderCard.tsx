"use client";

import { IOrder } from "@/types/order";
import OrderHeader from "./OrderHeader";
import { useDeliveryData } from "@/hooks/useDeliveryData";
import useRepeatOrder from "@/hooks/useRepeatOrder";
import DeliveryDatePicker from "./DeliveryDatePicker";
import ProductsSection from "@/components/ProductsSection";
import { useEffect, useState } from "react";
import OrderActions from "./OrderActions";
import MiniLoader from "@/components/MiniLoader";
import OrderDetails from "./OrderDetails";
import { useOrderProductsData } from "@/hooks/useOrderProductsData";
import { usePriceComparison } from "@/hooks/usePriceComparison";
import { useOrderPricing } from "@/hooks/useOrderPricing";
import { useOrderProducts } from "@/hooks/useOrderProducts";
import StockWarningsAlert from "./StockWarningsAlert";
import RepeatOrderSection from "./RepeatOrderSection";
import RepeatOrderSuccessAlert from "./RepeatOrderSuccessAlert";
import { ProductsData } from "@/types/userOrder";

const isDelivered = (order: IOrder): boolean => {
  const slotEnd = order.deliveryTimeSlot?.split("-")[1];
  if (!order.deliveryDate || !slotEnd) return false;
  const [hours, minutes] = slotEnd.split(":").map(Number);
  const deliveryEnd = new Date(order.deliveryDate);
  deliveryEnd.setHours(hours, minutes, 0, 0);
  return new Date() > deliveryEnd;
};

const OrderCard = ({ order, onOrderCancelled }: { order: IOrder; onOrderCancelled?: () => void }) => {
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showPriceWarning, setShowPriceWarning] = useState(false);

  const { productsData: fetchedProductsData, loading: productsDataLoading } =
    useOrderProductsData(order);

  const { orderProducts, stockWarnings } = useOrderProducts(
    order,
    fetchedProductsData
  );

  const { currentProducts, priceComparison } = usePriceComparison(
    order,
    fetchedProductsData
  );

  const { cartItemsForSummary, productsData, customPricing } = useOrderPricing(
    order,
    currentProducts
  );

  const {
    showDatePicker,
    showDeliveryButton,
    handleOrderClick,
    handleDeliveryClick,
    handleDateSelect,
    handleCancelDelivery,
    isRepeatOrderCreated,
    selectedDelivery,
    handleEditDelivery,
    handleRepeatOrderSuccess,
  } = useRepeatOrder();

  const { deliverySchedule } = useDeliveryData();

  const hasStockIssues = orderProducts.some(
    (product) => product.isLowStock || product.insufficientStock
  );
  const canCreateRepeatOrder = !hasStockIssues;
  const applyIndexStyles = !showOrderDetails;

  useEffect(() => {
    if (priceComparison?.hasChanges) {
      setShowPriceWarning(true);
    }
  }, [priceComparison]);

  if (productsDataLoading) {
    return <MiniLoader />;
  }

  const cancelled = order.status === "cancelled";
  const delivered = isDelivered(order);

  return (
    <div className="text-main-text">
      {cancelled && (
        <div className="text-red-500 text-sm font-medium mb-2 ml-1">Заказ отменён</div>
      )}
      {delivered && !cancelled && (
        <div className="text-green-600 text-sm font-medium mb-2 ml-1">Доставлен</div>
      )}
      <OrderHeader
        order={order}
        showDeliveryButton={showDeliveryButton}
        onOrderClick={handleOrderClick}
        onDeliveryClick={handleDeliveryClick}
        disabled={hasStockIssues}
        onOrderCancelled={onOrderCancelled}
      />
      <ProductsSection
        title=""
        products={orderProducts}
        applyIndexStyles={applyIndexStyles}
        isOrderPage={true}
      />
      <RepeatOrderSection
        isRepeatOrderCreated={isRepeatOrderCreated}
        selectedDelivery={selectedDelivery}
        canCreateRepeatOrder={canCreateRepeatOrder}
        order={order}
        priceComparison={priceComparison}
        showPriceWarning={showPriceWarning}
        onClosePriceWarning={() => setShowPriceWarning(false)}
        deliveryData={selectedDelivery}
        onEditDelivery={handleEditDelivery}
        productsData={productsData as unknown as ProductsData}
        cartItemsForSummary={cartItemsForSummary}
        customPricing={customPricing}
        onOrderSuccess={handleRepeatOrderSuccess}
      />
      <StockWarningsAlert
        warnings={stockWarnings}
        hasStockIssues={hasStockIssues}
      />
      {isRepeatOrderCreated && <RepeatOrderSuccessAlert />}
      <OrderActions
        showOrderDetails={showOrderDetails}
        onToggleDetails={() => setShowOrderDetails(!showOrderDetails)}
      />
      {showOrderDetails && <OrderDetails order={order} />}
      {showDatePicker && (
        <DeliveryDatePicker
          schedule={deliverySchedule}
          isCreatingOrder={false}
          onDateSelect={(date, timeSlot) =>
            handleDateSelect(date, timeSlot, order.deliveryAddress)
          }
          onCancel={handleCancelDelivery}
        />
      )}
    </div>
  );
};

export default OrderCard;
