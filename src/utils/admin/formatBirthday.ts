/** Форматирование даты рождения в ДД.ММ */
export const formatBirthday = (birthdayDate: string | null): string => {
  if (!birthdayDate) return "";
  const date = new Date(birthdayDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}.${month}`;
};
