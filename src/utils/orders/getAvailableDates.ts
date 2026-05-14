import { getThreeDaysDates } from "@/app/administrator/delivery-times/utils/getThreeDaysDates";
import { AvailableDate } from "@/types/availableDate";
import { Schedule } from "@/types/deliverySchedule";

/** Получить доступные даты доставки из расписания */
export const getAvailableDates = (schedule: Schedule): AvailableDate[] => {
  const threeDaysDates = getThreeDaysDates();
  return threeDaysDates
    .map((dateString) => {
      const daySchedule = schedule[dateString as keyof typeof schedule];
      if (!daySchedule) return null;
      const totalSlots = Object.values(daySchedule).filter((available) => available).length;
      return { date: new Date(dateString), dateString, totalSlots };
    })
    .filter((item): item is AvailableDate => item !== null && item.totalSlots > 0);
};
