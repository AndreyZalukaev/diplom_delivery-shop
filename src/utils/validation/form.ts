import { RegFormData } from "@/types/regFormData";

/** Валидация формы регистрации */
export const validateRegisterForm = (formData: RegFormData) => {
  if (!formData.phone || formData.phone === "+7" || formData.phone.replace(/\D/g, "").length < 11) {
    return { isValid: false, errorMessage: "Введите корректный номер телефона" };
  }
  if (!formData.surname || !/^[а-яА-ЯёЁa-zA-Z-]{2,}$/.test(formData.surname.trim())) {
    return { isValid: false, errorMessage: "Фамилия должна содержать минимум 2 буквы" };
  }
  if (!formData.firstName || !/^[а-яА-ЯёЁa-zA-Z-]{2,}$/.test(formData.firstName.trim())) {
    return { isValid: false, errorMessage: "Имя должно содержать минимум 2 буквы" };
  }
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!formData.password || !passwordRegex.test(formData.password)) {
    return { isValid: false, errorMessage: "Пароль должен содержать минимум 6 символов, буквы и цифры" };
  }
  if (formData.password !== formData.confirmPassword) {
    return { isValid: false, errorMessage: "Пароли не совпадают" };
  }
  if (!formData.birthdayDate || formData.birthdayDate.length < 10) {
    return { isValid: false, errorMessage: "Введите корректную дату рождения" };
  }
  if (!formData.location) {
    return { isValid: false, errorMessage: "Выберите населенный пункт" };
  }
  if (!formData.gender) {
    return { isValid: false, errorMessage: "Выберите пол" };
  }
  return { isValid: true, errorMessage: null };
};
