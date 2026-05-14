/** Проверка: день рождения в ближайшие 3 дня */
export const isBirthdaySoon = (birthdayDate: string | null): boolean => {
  if (!birthdayDate) return false;
  try {
    const now = new Date();
    const birthday = new Date(birthdayDate);
    const currentYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
    const diffTime = currentYearBirthday.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  } catch {
    return false;
  }
};
