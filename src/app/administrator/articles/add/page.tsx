"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleImageUploader from "../ArticleImageUploader";

export default function AddArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      setError("Заполните заголовок и текст");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let img = "/images/articles/article-1.jpeg";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          img = uploadData.url;
        }
      }

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), text: text.trim(), img }),
      });
      if (res.ok) {
        router.push("/administrator/articles");
      } else {
        const data = await res.json();
        setError(data.error || "Ошибка сохранения");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#414141] mb-6">Добавить статью</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-[#414141]"
            placeholder="Заголовок статьи"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
          <ArticleImageUploader onImageUploadAction={setImageFile} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Текст</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-[#414141] resize-y"
            placeholder="Текст статьи..."
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#ff6633] text-white rounded-lg hover:bg-[#e55a2e] disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
