"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPhonePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user.phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Подтверждение телефона</h1>
        <p className="text-gray-500 mb-6">Введите 4-значный код из SMS</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" maxLength={4} className="border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={code.length !== 4} className="py-3 bg-[#ff6633] text-white rounded-lg font-medium disabled:opacity-50">Подтвердить</button>
        </form>
      </div>
    </div>
  );
}
