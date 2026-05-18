"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "@/app/(auth)/_components/PhoneInput";
import PersonInput from "@/app/(auth)/(reg)/PersonInput";
import PasswordInput from "@/app/(auth)/_components/PasswordInput";
import DateInput from "@/app/(auth)/(reg)/DateInput";
import SelectCity from "@/app/(auth)/(reg)/SelectCity";
import SelectRegionPlaceholder from "@/app/(auth)/(reg)/_components/SelectRegionPlaceholder";
import GenderSelect from "@/app/(auth)/(reg)/GenderSelect";
import CardInput from "@/app/(auth)/(reg)/CardInput";
import CheckboxCard from "@/app/(auth)/(reg)/CheckboxCard";
import EmailInput from "@/app/(auth)/(reg)/EmailInput";
import RegFormFooter from "@/app/(auth)/(reg)/RegFormFooter";
import { validateRegisterForm } from "@/utils/validation/form";
import Loader from "@/components/Loader";
import ErrorComponent from "@/components/ErrorComponent";
import { AuthFormLayout } from "@/app/(auth)/_components/AuthFormLayout";
import { useRegFormContext } from "@/contexts/RegFormContext";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{
    error: Error;
    userMessage: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [invalidFormMessage, setInvalidFormMessage] = useState("");
  const { regFormData, setRegFormData } = useRegFormContext();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, type } = e.target;
    let value = type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;

    if (invalidFormMessage) {
      setInvalidFormMessage("");
    }

    if (id === "hasCard" && value === true) {
      setRegFormData((prev) => ({
        ...prev,
        hasCard: true,
        card: "",
      }));
      return;
    }
    setRegFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setInvalidFormMessage("");

    const validation = validateRegisterForm(regFormData);
    if (!validation.isValid) {
      setInvalidFormMessage(
        validation.errorMessage || "Заполните поля корректно"
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regFormData.email,
          password: regFormData.password,
          name: `${regFormData.firstName} ${regFormData.surname}`.trim(),
          phone: regFormData.phone,
          birthDate: regFormData.birthdayDate,
          region: regFormData.region,
          location: regFormData.location,
          gender: regFormData.gender,
          loyaltyCard: regFormData.hasCard ? null : regFormData.card,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      localStorage.setItem("user", JSON.stringify({ phone: regFormData.phone })); router.replace("/verify-phone");
    } catch (err) {
      setError({
        error: err instanceof Error ? err : new Error('Ошибка регистрации'),
        userMessage: err instanceof Error ? err.message : 'Ошибка регистрации',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => validateRegisterForm(regFormData).isValid;

  if (isLoading) return <Loader />;
  if (error)
    return (
      <ErrorComponent error={error.error} userMessage={error.userMessage} />
    );

  return (
    <AuthFormLayout variant="register">
      <h1 className="text-2xl font-bold text-center mb-10">Регистрация</h1>
      <h2 className="text-lg font-bold text-center mb-6">
        Обязательные поля
      </h2>
      <form
        onSubmit={handleSubmit}
        autoComplete="off"
        className="w-full max-w-[552px] mx-auto flex flex-col justify-center"
      >
        <div className="w-full flex flex-row flex-wrap justify-center gap-x-8 gap-y-4">
          <div className="flex flex-col gap-y-4 items-start">
            <PhoneInput
              id="phone"
              label="Телефон *"
              value={regFormData.phone}
              onChangeAction={handleChange}
            />
            <PersonInput
              id="surname"
              label="Фамилия *"
              value={regFormData.surname}
              onChange={handleChange}
            />
            <PersonInput
              id="firstName"
              label="Имя *"
              value={regFormData.firstName}
              onChange={handleChange}
            />
            <PasswordInput
              id="password"
              label="Пароль *"
              value={regFormData.password}
              onChangeAction={handleChange}
              showPassword={showPassword}
              togglePasswordVisibilityAction={() =>
                setShowPassword(!showPassword)
              }
              showRequirements={true}
            />
            <PasswordInput
              id="confirmPassword"
              label="Подтвердите пароль *"
              value={regFormData.confirmPassword}
              onChangeAction={handleChange}
              showPassword={showPassword}
              togglePasswordVisibilityAction={() =>
                setShowPassword(!showPassword)
              }
              compareWith={regFormData.password}
            />
          </div>
          <div className="flex flex-col gap-y-4 items-start">
            <DateInput
              value={regFormData.birthdayDate}
              onChangeAction={(value) =>
                setRegFormData((prev) => ({ ...prev, birthdayDate: value }))
              }
            />
            <SelectRegionPlaceholder
              value={regFormData.region}
              onChangeAction={handleChange}
            />
            <SelectCity
              value={regFormData.location}
              onChangeAction={handleChange}
            />
            <GenderSelect
              value={regFormData.gender}
              onChangeAction={(gender) =>
                setRegFormData((prev) => ({ ...prev, gender }))
              }
            />
          </div>
        </div>
        <h2 className="text-lg font-bold text-center mb-6 mt-10">
          Необязательные поля
        </h2>
        <div className="w-full flex flex-row flex-wrap justify-center gap-x-8 gap-y-4">
          <div className="flex flex-col w-65 gap-y-4">
            <CardInput
              id="card"
              label="Номер карты"
              value={regFormData.card || ""}
              onChangeAction={handleChange}
              disabled={regFormData.hasCard}
            />
            <CheckboxCard
              id="hasCard"
              checked={regFormData.hasCard || false}
              onChangeAction={handleChange}
            />
          </div>
          <EmailInput
            id="email"
            label="Email"
            value={regFormData.email || ""}
            onChangeAction={handleChange}
          />
        </div>
        {invalidFormMessage && (
          <div className="text-red-500 text-center my-4 p-4 bg-red-50 rounded">
            {invalidFormMessage}
          </div>
        )}
        <RegFormFooter isFormValid={isFormValid()} />
      </form>
    </AuthFormLayout>
  );
};

export default RegisterPage;
