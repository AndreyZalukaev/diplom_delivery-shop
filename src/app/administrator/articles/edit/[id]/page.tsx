"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ArticleImageUploader from "../../ArticleImageUploader";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [currentImg, setCurrentImg] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/articles?id=${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title || "");
        setText(data.text || "");
        setCurrentImg(data.img || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Ошибка загрузки");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) {
      setError("Заполните заголовок и текст");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let img = imageRemoved ? "" : currentImg;
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: parseInt(id), title: title.trim(), text: text.trim(), img: img || "/images/articles/article-1.jpeg" }),
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

  if (loading) return <div className="text-center py-12">Загрузка...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-[#414141] mb-6">Редактировать статью</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-[#414141]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Изображение</label>
          <ArticleImageUploader
            onImageUploadAction={(file) => {
              setImageFile(file);
              if (file) setImageRemoved(false);
            }}
            onImageRemove={() => {
              setImageRemoved(true);
              setImageFile(null);
            }}
            currentImage={imageRemoved ? undefined : currentImg}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Текст</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-[#414141] resize-y"
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
