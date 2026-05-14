import { isTimeSlotPassed } from "@/app/(cart)/cart/utils/isTimeSlotPassed";
import { Schedule } from "@/types/deliverySchedule";

/** Получить доступные временные слоты на дату */
export const getAvailableTimeSlots = (date: Date, schedule: Schedule): string[] => {
  const dateString = date.toISOString().split("T")[0];
  const daySchedule = schedule[dateString as keyof typeof schedule];
  if (!daySchedule) return [];
  return Object.entries(daySchedule)
    .filter(([timeSlot, available]) => {
      if (!available) return false;
      return !isTimeSlotPassed(timeSlot, dateString);
    })
    .map(([timeSlot]) => timeSlot)
    .sort();
};
