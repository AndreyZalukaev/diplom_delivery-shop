"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "@/app/(auth)/_components/PhoneInput";
import PersonInput from "@/app/(auth)/(reg)/_components/PersonInput";
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

/** Страница регистрации */
const RegisterPage = () => {
  const router = useRouter();
  const { regFormData, setRegFormData, resetRegForm } = useRegFormContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const validation = validateRegisterForm(regFormData);
    if (!validation.isValid) {
      setError(validation.errorMessage);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regFormData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Ошибка регистрации");

      setSuccess(true);
      setTimeout(() => {
        resetRegForm();
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader text="регистрации" />;
  if (error) return <ErrorComponent error={new Error(error)} userMessage={error} />;

  return (
    <AuthFormLayout>
      <h1 className="text-2xl font-bold text-[#414141] text-center mb-8">Регистрация</h1>
      {success && <div className="p-3 bg-green-100 text-green-700 rounded text-sm text-center mb-4">Регистрация успешна! Перенаправляем...</div>}
      <form onSubmit={handleSubmit} autoComplete="off" className="w-65 mx-auto flex flex-col gap-y-4">
        <PhoneInput value={regFormData.phone || "+7 "} onChangeAction={(e) => setRegFormData({ ...regFormData, phone: e.target.value })} />
        <PersonInput placeholder="Фамилия" value={regFormData.surname || ""} onChangeAction={(e) => setRegFormData({ ...regFormData, surname: e.target.value })} />
        <PersonInput placeholder="Имя" value={regFormData.firstName || ""} onChangeAction={(e) => setRegFormData({ ...regFormData, firstName: e.target.value })} />
        <PasswordInput id="password" label="Пароль" value={regFormData.password || ""} onChangeAction={(e) => setRegFormData({ ...regFormData, password: e.target.value })} showPassword={false} togglePasswordVisibilityAction={() => {}} />
        <PasswordInput id="confirmPassword" label="Подтвердите пароль" value={regFormData.confirmPassword || ""} onChangeAction={(e) => setRegFormData({ ...regFormData, confirmPassword: e.target.value })} showPassword={false} togglePasswordVisibilityAction={() => {}} />
        <DateInput value={regFormData.birthdayDate || ""} onChangeAction={(e) => setRegFormData({ ...regFormData, birthdayDate: e.target.value })} />
        <SelectRegionPlaceholder />
        <SelectCity />
        <GenderSelect />
        <CardInput />
        <CheckboxCard />
        <EmailInput />
        <RegFormFooter isLoading={isLoading} />
      </form>
    </AuthFormLayout>
  );
};

export default RegisterPage;
