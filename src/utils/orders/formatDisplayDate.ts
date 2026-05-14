/** Отображение даты: Сегодня/Завтра/дата */
export const formatDisplayDate = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Сегодня";
  if (date.toDateString() === tomorrow.toDateString()) return "Завтра";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
};
