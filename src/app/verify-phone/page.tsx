"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthFormLayout } from "@/app/(auth)/_components/AuthFormLayout";

/** Страница подтверждения телефона после регистрации */
export default function VerifyPhonePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [timer, setTimer] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Получаем телефон из localStorage
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.phone) {
        setPhone(user.phone);
      } else {
        router.replace("/register");
      }
    } catch {
      router.replace("/register");
    }
  }, [router]);

  // Функция отправки кода
  const sendCode = useCallback(async () => {
    if (!phone || timer > 0) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка отправки");
      setCodeSent(true);
      setTimer(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки кода");
    } finally {
      setLoading(false);
    }
  }, [phone, timer]);

  // Автоотправка кода при загрузке
  useEffect(() => {
    if (phone && !codeSent) {
      sendCode();
    }
  }, [phone, codeSent, sendCode]);

  // Таймер обратного отсчёта
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Фокус на поле ввода
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4) return;
    setLoading(true);
    setError("");

    try {
      // Проверяем код
      const verifyRes = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(verifyData.error || "Неверный код");

      // Подтверждаем телефон в БД
      const updateRes = await fetch("/api/auth/verify-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.error || "Ошибка подтверждения");

      setSuccess(true);
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  // Форматирование таймера
  const timerDisplay = timer > 0 ? `Повторно через 0:${timer.toString().padStart(2, "0")}` : "Отправить код повторно";

  if (success) {
    return (
      <AuthFormLayout>
        <div className="flex flex-col items-center gap-y-6 py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-center">Телефон подтверждён!</h1>
          <p className="text-gray-500 text-center">Сейчас вы будете перенаправлены на страницу входа...</p>
        </div>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout>
      <div className="flex flex-col gap-y-6">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 mb-4 flex items-center justify-center">
            <span className="text-3xl">📱</span>
          </div>
          <h1 className="text-2xl font-bold text-center">Подтверждение телефона</h1>
        </div>

        <p className="text-center text-gray-500">
          Мы отправили 4-значный код на номер:{" "}
          <span className="text-[#ff6633] font-medium">{phone}</span>
        </p>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 items-center">
          <div>
            <p className="text-center text-[#8f8f8f] mb-2">Код из SMS</p>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={4}
              value={code}
              onChange={handleCodeChange}
              placeholder="0000"
              className="w-28 h-15 mx-auto text-center px-4 py-3 border border-[#bfbfbf] rounded focus:border-[#70c05b] focus:shadow-[0_0_0_3px_rgba(112,192,91,0.2)] focus:bg-white focus:outline-none text-2xl tracking-widest"
            />
          </div>

          <button
            type="submit"
            disabled={code.length !== 4 || loading}
            className="w-full max-w-65 h-10 bg-[#ff6633] text-white rounded font-medium hover:bg-[#e55a2e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Проверка...
              </>
            ) : (
              "Подтвердить"
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setCodeSent(false);
              setTimer(0);
              setTimeout(() => sendCode(), 100);
            }}
            disabled={timer > 0 || loading}
            className="text-[#ff6633] hover:underline text-sm disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {timer > 0 ? timerDisplay : "Отправить код повторно"}
          </button>
        </form>
      </div>
    </AuthFormLayout>
  );
}
