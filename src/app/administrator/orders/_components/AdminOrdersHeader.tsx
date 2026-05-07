interface AdminOrdersHeaderProps {
  stats: {
    nextThreeDaysOrders: number;
  } | null;
}

const AdminOrdersHeader = ({ stats }: AdminOrdersHeaderProps) => {
  return (
    <div className="mb-6 md:mb-8 xl:mb-10 relative inline-block">
      <h1 className="text-4xl md:text-5xl xl:text-[64px] text-[#414141] font-bold">
        Заказы
      </h1>
      {stats && stats.nextThreeDaysOrders > 0 && (
        <div className="absolute -top-2 -right-2 translate-x-full bg-[#ff6633] rounded-full w-8 h-8 flex justify-center items-center text-sm text-white font-medium">
          {stats.nextThreeDaysOrders}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersHeader;
