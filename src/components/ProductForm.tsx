"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// --- Типы ---
type Product = {
  _id?: string;
  title_ua: string;
  priceUAH: number;
  category?: string;
  desc_ua?: string;
  stock?: number;
  active: boolean;
  images: string[];
  showDetailsBlocks?: boolean;
  availability?: "in_stock" | "on_order" | "out_of_stock";
  details_ua?: string; 
  delivery_ua?: string;
};

// --- Утилиты (Логика та же, скрыл для краткости, если нужно - верну) ---
async function compressImage(file: File, maxWidth = 2000, quality = 0.85): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxWidth / img.width, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx!.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (!blob) return resolve(file);
        resolve(new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), { type: "image/jpeg" }));
      }, "image/jpeg", quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

// --- Компонент Формы ---
export default function ProductForm({
  product,
  isEdit = false,
}: {
  product?: Product;
  isEdit?: boolean;
}) {
  const router = useRouter();
  
  const defaultProduct: Product = {
    title_ua: "",
    priceUAH: 0,
    category: "",
    desc_ua: "",
    stock: 0,
    active: true,
    images: [],
    showDetailsBlocks: false,
    availability: "in_stock",
    details_ua: "",
    delivery_ua: "",
  };

  const [form, setForm] = useState<Product>(
    product ? { ...defaultProduct, ...product } : defaultProduct
  );

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- Хелперы ---
  function update<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // --- Загрузка и управление фото (логика сохранена) ---
  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    let file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Оберіть зображення або відео");
      e.currentTarget.value = "";
      return;
    }

    if (isImage) {
      file = await compressImage(file, 2000, 0.85);
    }

    if (file.size > 25 * 1024 * 1024) {
      alert("Файл занадто великий (>25MB)");
      e.currentTarget.value = "";
      return;
    }

    setUploading(true);
    const base64 = await toBase64(file);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: base64, fileName: file.name }),
    });

    const data = await res.json().catch(() => null);
    if (data?.ok && data.url) {
      update("images", [...form.images, data.url]);
    } else {
      alert("Помилка завантаження");
    }
    setUploading(false);
    e.currentTarget.value = "";
  }

  function removeImage(idx: number) {
    update("images", form.images.filter((_, i) => i !== idx));
  }
  function moveImage(idx: number, direction: -1 | 1) {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= form.images.length) return;
    const arr = [...form.images];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    update("images", arr);
  }
  function toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }
  const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

  // --- Сабмит ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/products/${product?._id}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      
      alert("✅ Збережено успішно");
      router.refresh();
      router.push("/admin/products");
    } catch (e) {
      alert("❌ " + e);
    } finally {
      setSaving(false);
    }
  }

  // --- UI Components Styles ---
  const cardClass = "bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-stone-100";
  const labelClass = "block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2";
  const inputClass = "w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 transition-all focus:border-stone-400 focus:bg-white focus:ring-4 focus:ring-stone-100 outline-none";
  const selectClass = "w-full rounded-xl border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 transition-all focus:border-stone-400 focus:bg-white outline-none appearance-none cursor-pointer";

  return (
    <form onSubmit={onSubmit} className="max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">
            {isEdit ? "Редагування товару" : "Створити товар"}
          </h1>
          <p className="text-stone-500 mt-1">Заповніть інформацію про новий виріб</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 rounded-xl bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-lg shadow-stone-900/20"
          >
            {saving ? "Збереження..." : "Зберегти товар"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- ЛІВА КОЛОНКА (Основна) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Назва та Опис */}
          <div className={cardClass}>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Назва товару</label>
                <input
                  type="text"
                  value={form.title_ua}
                  onChange={(e) => update("title_ua", e.target.value)}
                  placeholder="Наприклад: Різдвяний Павук 'Зоря'"
                  required
                  className={`text-lg font-medium ${inputClass}`}
                />
              </div>
              <div>
                <label className={labelClass}>Опис</label>
                <textarea
                  value={form.desc_ua || ""}
                  onChange={(e) => update("desc_ua", e.target.value)}
                  rows={6}
                  placeholder="Розкажіть про матеріали, історію створення..."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Медіа Галерея */}
          <div className={cardClass}>
            <div className="flex items-center justify-between mb-4">
              <label className={labelClass + " mb-0"}>Медіа</label>
              <span className="text-xs text-stone-400 font-medium">
                {form.images.length} файл(ів)
              </span>
            </div>

            {/* Зона завантаження */}
            <div className="mb-6">
              <label className="group relative flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-stone-50 hover:border-stone-400 transition-all overflow-hidden">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-stone-400 group-hover:text-stone-600 transition-colors">
                  <div className="w-12 h-12 mb-3 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl">
                    {uploading ? "⏳" : "📷"}
                  </div>
                  <p className="mb-1 text-sm font-medium">
                    <span className="font-semibold text-stone-700">Натисніть для завантаження</span> або перетягніть
                  </p>
                  <p className="text-xs text-stone-400">
                    JPG, PNG, MP4 до 25MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={onPickFile}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                    <span className="animate-pulse font-medium text-stone-600">Завантаження...</span>
                  </div>
                )}
              </label>
            </div>

            {/* Сетка фото */}
            {form.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {form.images.map((src, i) => {
                  const isVideo = isVideoUrl(src);
                  return (
                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
                      {isVideo ? (
                        <video src={src} className="w-full h-full object-cover opacity-90" muted loop />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      )}
                      
                      {/* Оверлей управления */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={() => moveImage(i, -1)}
                          className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center backdrop-blur-md transition"
                        >←</button>
                         <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="w-8 h-8 rounded-full bg-rose-500/80 text-white hover:bg-rose-600 flex items-center justify-center backdrop-blur-md transition"
                        >✕</button>
                        <button
                          type="button"
                          onClick={() => moveImage(i, 1)}
                          className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center backdrop-blur-md transition"
                        >→</button>
                      </div>

                      {/* Бейдж "Главное" */}
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md">
                          ГОЛОВНЕ
                        </div>
                      )}
                      {isVideo && (
                        <div className="absolute bottom-2 right-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md">
                          VIDEO
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                Галерея порожня
              </div>
            )}
          </div>
          
           {/* Опции отображения */}
           <div className={`${cardClass} transition-all duration-300`}>
             <div className="flex items-start justify-between mb-4">
                <div>
                   <h3 className="font-bold text-stone-800">Додаткові інформаційні блоки</h3>
                   <p className="text-sm text-stone-500 mt-1">
                     "Деталі виробу" та "Доставка/Пакування". Увімкніть, щоб редагувати.
                   </p>
                </div>
                
                {/* Тоггл перемикач */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={!!form.showDetailsBlocks}
                    onChange={(e) => update("showDetailsBlocks", e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-stone-900"></div>
                </label>
             </div>

             {/* Поля редагування (показуються тільки якщо showDetailsBlocks === true) */}
             {form.showDetailsBlocks && (
               <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                 <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className={labelClass}>Блок 1: Деталі виробу</label>
                    <textarea
                      value={form.details_ua || ""}
                      onChange={(e) => update("details_ua", e.target.value)}
                      rows={3}
                      placeholder="Наприклад: Матеріали: солома, нитки. Розмір: 30х30 см."
                      className={`${inputClass} bg-white`}
                    />
                 </div>

                 <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <label className={labelClass}>Блок 2: Доставка та Пакування</label>
                    <textarea
                      value={form.delivery_ua || ""}
                      onChange={(e) => update("delivery_ua", e.target.value)}
                      rows={3}
                      placeholder="Наприклад: Відправка НП протягом 2-3 днів. Надійна коробка."
                      className={`${inputClass} bg-white`}
                    />
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* --- ПРАВА КОЛОНКА (Сайдбар) --- */}
        <div className="space-y-6">
          
          {/* Статус */}
          <div className={cardClass}>
            <label className={labelClass}>Статус</label>
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className={`text-sm font-medium ${form.active ? "text-green-600" : "text-stone-500"}`}>
                {form.active ? "Активний (На сайті)" : "Чернетка (Приховано)"}
              </span>
              <div 
                onClick={() => update("active", !form.active)}
                className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${form.active ? 'bg-green-500' : 'bg-stone-300'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${form.active ? 'translate-x-5' : ''}`}></div>
              </div>
            </div>
          </div>

          {/* Ціна та Сток */}
          <div className={cardClass}>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Ціна (UAH)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₴</span>
                  <input
                    type="number"
                    value={form.priceUAH}
                    onChange={(e) => update("priceUAH", Number(e.target.value))}
                    className={`${inputClass} pl-9 font-mono text-lg`}
                  />
                </div>
              </div>

              <hr className="border-stone-100" />

              <div>
                <label className={labelClass}>Кількість</label>
                <input
                  type="number"
                  value={form.stock || 0}
                  onChange={(e) => update("stock", Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Наявність</label>
                <div className="relative">
                   <select
                    value={form.availability || "in_stock"}
                    onChange={(e) => update("availability", e.target.value as Product["availability"])}
                    className={`${selectClass}`}
                  >
                    <option value="in_stock">✅ В наявності</option>
                    <option value="on_order">⏳ Під замовлення</option>
                    <option value="out_of_stock">❌ Немає в наявності</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-stone-500">▼</div>
                </div>
              </div>
            </div>
          </div>

          {/* Категорія */}
          <div className={cardClass}>
            <label className={labelClass}>Категорія</label>
            <div className="relative">
              <select
                value={form.category || ""}
                onChange={(e) => update("category", e.target.value)}
                className={selectClass}
              >
                <option value="">— Оберіть —</option>
                <optgroup label="Павуки">
                  <option value="pavuky-rizdvo">Павуки до Різдва</option>
                  <option value="vyshyti-pavuky">Вишиті павуки</option>
                  <option value="pavuky-velykden">Павуки великодні</option>
                  <option value="nabory-pavukiv">Набори павуків</option>
                  <option value="nabory-vyshytykh-pavukiv">Набори вишитих</option>
                </optgroup>
                <optgroup label="Вінки">
                  <option value="vinky-zlak">Вінки зі злаків</option>
                  <option value="vinky-rizdviani">Вінки Різдвяні</option>
                  <option value="vinky-shkarlupa">Вінки зі шкаралупи</option>
                </optgroup>
                <optgroup label="Інше">
                  <option value="snopy-didukhy">Снопи та дідухи</option>
                  <option value="vyroby-sino">Вироби з сіна</option>
                  <option value="kolosky-soloma-sino">Колоски, солома</option>
                </optgroup>
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-stone-500">▼</div>
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}