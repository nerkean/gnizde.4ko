"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  PackageOpen, 
  Loader2,
  AlertCircle 
} from "lucide-react";

type Product = {
  _id: string;
  title_ua: string;
  priceUAH: number;
  category?: string;
  active: boolean;
  createdAt: string;
  // Добавляем поля для картинки (API их обычно возвращает)
  images?: string[]; 
  imageUrl?: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Загрузка данных
  useEffect(() => {
    fetch("/api/admin/products?limit=100", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setProducts(data.items);
        else setError(data.error || "Помилка завантаження");
      })
      .catch(() => setError("Помилка мережі"))
      .finally(() => setLoading(false));
  }, []);

  // Удаление товара
  async function deleteProduct(id: string) {
    if (!confirm("Ви впевнені, що хочете видалити цей товар? Цю дію неможливо скасувати.")) return;
    
    // Оптимистичное обновление (сразу убираем из UI)
    const oldProducts = [...products];
    setProducts((prev) => prev.filter((p) => p._id !== id));

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
    } catch (e) {
      alert("❌ Помилка видалення");
      setProducts(oldProducts); // Вернуть как было
    }
  }

  // Фильтрация поиска
  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const lower = search.toLowerCase();
    return products.filter((p) => 
      p.title_ua.toLowerCase().includes(lower) || 
      p.category?.toLowerCase().includes(lower) ||
      p._id.includes(lower)
    );
  }, [products, search]);

  // Получение картинки для превью
  const getThumb = (p: Product) => {
    if (p.imageUrl) return p.imageUrl;
    if (p.images && p.images.length > 0) return p.images[0];
    return "/images/placeholder.svg";
  };

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center text-stone-400">
        <Loader2 className="animate-spin mr-2" /> Завантаження товарів...
      </div>
    );

  if (error)
    return (
      <div className="flex h-[50vh] items-center justify-center text-rose-500">
        <AlertCircle className="mr-2" /> {error}
      </div>
    );

  return (
    <div className="space-y-8 p-6 sm:p-10 max-w-7xl mx-auto">
      
      {/* Хедер страницы */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-stone-900">
            Товари
          </h1>
          <p className="text-stone-500 mt-1">
            Керування каталогом ({products.length})
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-stone-900/10 hover:bg-stone-800 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={18} />
          Додати товар
        </Link>
      </div>

      {/* Панель поиска */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
          <Search size={20} />
        </div>
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук за назвою або категорією..."
          className="w-full rounded-2xl border border-stone-200 bg-white pl-12 pr-4 py-4 text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 transition-all outline-none"
        />
      </div>

      {/* Таблица */}
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
                <th className="px-6 py-4">Товар</th>
                <th className="px-6 py-4">Ціна</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4">Дата</th>
                <th className="px-6 py-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => (
                <tr key={p._id} className="group hover:bg-stone-50/80 transition-colors">
                  
                  {/* Название + Фото */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-stone-50">
                        <Image 
                          src={getThumb(p)} 
                          alt={p.title_ua} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 line-clamp-1">{p.title_ua}</div>
                        <div className="text-xs text-stone-500">{p.category || "Без категорії"}</div>
                      </div>
                    </div>
                  </td>

                  {/* Цена */}
                  <td className="px-6 py-4 font-mono font-medium text-stone-700">
                    {p.priceUAH.toLocaleString()} ₴
                  </td>

                  {/* Статус */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                        p.active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-stone-100 text-stone-500 border-stone-200"
                      }`}
                    >
                      {p.active ? "Активний" : "Чернетка"}
                    </span>
                  </td>

                  {/* Дата */}
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(p.createdAt).toLocaleDateString("uk-UA")}
                  </td>

                  {/* Действия */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/products/edit/${p._id}`}
                        className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        title="Редагувати"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пустое состояние */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-stone-400">
            <div className="mb-4 rounded-full bg-stone-50 p-6">
              <PackageOpen size={48} className="opacity-50" />
            </div>
            <p className="text-lg font-medium text-stone-500">Товарів не знайдено</p>
            <p className="text-sm">Спробуйте змінити пошуковий запит або додайте новий товар.</p>
          </div>
        )}
      </div>
    </div>
  );
}