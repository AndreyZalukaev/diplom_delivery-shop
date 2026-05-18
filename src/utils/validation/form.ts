import { RegFormData } from "@/types/regFormData";

export const validateRegisterForm = (formData: RegFormData) => {
  // Проверка телефона
  if (!formData.phone || formData.phone === "+7" || formData.phone.replace(/\D/g, "").length < 11) {
    return {
      isValid: false,
      errorMessage: "Введите корректный номер телефона",
    };
  }

  // Проверка фамилии
  if (
    !formData.surname ||
    !/^[а-яА-ЯёЁa-zA-Z-]{2,}$/.test(formData.surname.trim())
  ) {
    return {
      isValid: false,
      errorMessage: "Фамилия должна содержать минимум 2 буквы",
    };
  }

  // Проверка имени
  if (
    !formData.firstName ||
    !/^[а-яА-ЯёЁa-zA-Z-]{2,}$/.test(formData.firstName.trim())
  ) {
    return {
      isValid: false,
      errorMessage: "Имя должно содержать минимум 2 буквы",
    };
  }

  // Проверка пароля
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!formData.password || !passwordRegex.test(formData.password)) {
    return {
      isValid: false,
      errorMessage: "Пароль должен содержать минимум 6 символов, буквы и цифры",
    };
  }

  // Проверка подтверждения пароля
  if (formData.password !== formData.confirmPassword) {
    return {
      isValid: false,
      errorMessage: "Пароли не совпадают",
    };
  }

  // Проверка даты рождения
  if (!formData.birthdayDate || formData.birthdayDate.length < 10) {
    return {
      isValid: false,
      errorMessage: "Введите корректную дату рождения",
    };
  }

  // Проверка региона
  if (!formData.region) {
    return {
      isValid: false,
      errorMessage: "Выберите регион",
    };
  }

  // Проверка населенного пункта
  if (!formData.location) {
    return {
      isValid: false,
      errorMessage: "Выберите населенный пункт",
    };
  }

  // Проверка пола
  if (!formData.gender) {
    return {
      isValid: false,
      errorMessage: "Выберите пол",
    };
  }

  return { isValid: true, errorMessage: null };
};
