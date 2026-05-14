export type UserRole = "user" | "admin" | "manager";

/** Стили бейджа роли */
export const getRoleStyles = (role: UserRole): string => {
  switch (role) {
    case "admin": return "bg-[#ffc7c7] text-[#d80000]";
    case "manager": return "bg-[#e5ffde] text-[#008c48]";
    default: return "bg-[#f3f2f1] text-[#414141]";
  }
};

/** Текст роли */
export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "admin": return "Администратор";
    case "manager": return "Менеджер";
    default: return "Пользователь";
  }
};
