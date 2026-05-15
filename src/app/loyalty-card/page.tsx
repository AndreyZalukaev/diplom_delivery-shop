/** Страница активации карты лояльности */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoyaltyCardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<{ id: number; has_card?: boolean } | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAlreadyHasModal, setShowAlreadyHasModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)user=([^;]*)/);
      if (!match) return setMounted(true);
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      setUserData(parsed);
      if (parsed?.has_card === true) {
        setShowAlreadyHasModal(true);
      }
    } catch {}
    setMounted(true);
  }, []);

  const userId = userData?.id || null;

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cardNumber.replace(/\s/g, "");
    if (clean.length !== 16) {
      setError("Введите 16 цифр номера карты");
      return;
    }

    if (!userId) {
      setError("Необходимо авторизоваться");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, cardNumber: clean }),
      });

      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...userData, loyalty_card: clean, has_card: true };
        document.cookie = `user=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/; max-age=86400`;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("user-login"));

        setSuccess("Карта успешно активирована! Бонусы будут начисляться при следующих покупках.");
        setCardNumber("");
        setTimeout(() => router.push("/"), 3000);
      } else {
        setError(data.error || "Ошибка активации карты");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      {showAlreadyHasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-[#ff6633]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#ff6633]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#414141] mb-2">У вас уже есть карта</h2>
            <p className="text-gray-500 mb-6">
              Карта лояльности уже привязана к вашему аккаунту. Бонусы начисляются автоматически при каждой покупке.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-[#ff6633] text-white rounded-lg hover:bg-[#e55a2e] transition-colors font-medium">На главную</button>
              <button onClick={() => router.push("/user-profile")} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">В профиль</button>
            </div>
          </div>
        </div>
      )}

      {!showAlreadyHasModal && (
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#ff6633] to-[#ff8a5c] p-8 text-white text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Карта «Северяночка»</h1>
              <p className="text-white/90 text-sm md:text-base">Получайте бонусы с каждой покупки</p>
            </div>
            <div className="p-6 md:p-8">
              {!userId && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                  <p className="text-yellow-800 mb-3">Для активации карты необходимо войти в аккаунт</p>
                  <button onClick={() => router.push("/login")} className="px-4 py-2 bg-[#ff6633] text-white rounded-lg hover:bg-[#e55a2e] transition-colors">Войти</button>
                </div>
              )}
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-600 font-medium text-lg">{success}</p>
                  <p className="text-gray-500 text-sm mt-2">Сейчас вы будете перенаправлены на главную...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Номер карты</label>
                    <input type="text" value={cardNumber} onChange={handleChange} placeholder="0000 0000 0000 0000" maxLength={19} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg text-center tracking-wider" disabled={loading} />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  </div>
                  <button type="submit" disabled={loading || !userId} className="w-full py-3 bg-[#ff6633] text-white rounded-lg font-medium text-lg hover:bg-[#e55a2e] disabled:opacity-50 transition-colors">
                    {loading ? "Проверка..." : "Активировать карту"}
                  </button>
                  <p className="text-xs text-gray-400 text-center">Введите номер карты, полученной в магазине. Бонусы начисляются автоматически при каждой покупке.</p>
                </form>
              )}
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 bg-[#ff6633]/10 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-[#ff6633] font-bold">5%</span></div>
              <p className="text-xs text-gray-600">Бонусов с покупок</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-[#ff6633]/10 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-[#ff6633] font-bold">2x</span></div>
              <p className="text-xs text-gray-600">Бонусов на акции</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-[#ff6633]/10 rounded-full flex items-center justify-center mx-auto mb-2"><span className="text-[#ff6633] font-bold">🎁</span></div>
              <p className="text-xs text-gray-600">Подарки в ДР</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
