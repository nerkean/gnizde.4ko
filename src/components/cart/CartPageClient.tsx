"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Minus, Plus, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useCart } from "@/lib/cartContext"; // 👈 Убедитесь, что этот путь правильный

export default function CartPageClient() {
  const { items, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    messenger: "telegram", // или viber/whatsapp
    delivery: "nova_poshta",
    city: "",
    warehouse: "",
    comment: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Отправляем заказ на API (который отправит в Telegram)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items,
          total,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        clearCart();
        // Перенаправление на страницу "Спасибо"
        router.push("/thank-you"); 
      } else {
        alert("Сталася помилка при оформленні. Спробуйте ще раз.");
      }
    } catch (error) {
      console.error(error);
      alert("Помилка з'єднання");
    } finally {
      setLoading(false);
    }
  };

  // --- Если корзина пуста ---
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="h-24 w-24 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-stone-400">
          <ShoppingBagX size={48} />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Ваш кошик порожній</h1>
        <p className="text-stone-500 mb-8 max-w-md">
          Здається, ви ще нічого не додали. Перегляньте наш каталог, там багато цікавого!
        </p>
        <Link
          href="/catalog"
          className="bg-stone-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-stone-800 transition shadow-lg shadow-stone-900/10"
        >
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  // --- Основной интерфейс ---
  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Оформлення замовлення</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА: Список товаров */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <h2 className="text-lg font-semibold mb-4 text-stone-900">Товари у кошику</h2>
            
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product._id} className="flex gap-4 sm:gap-6 py-4 border-b border-stone-100 last:border-0 last:pb-0">
                  {/* Фото */}
                  <div className="h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 border border-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images?.[0] || "/images/placeholder.svg"}
                      alt={item.product.title_ua}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Инфо */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-stone-900 line-clamp-2">
                          <Link href={`/product/${item.product.slug}`} className="hover:underline">
                            {item.product.title_ua}
                          </Link>
                        </h3>
                        <button 
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-stone-400 hover:text-rose-500 transition p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-stone-500 text-sm mt-1">{item.product.category}</p>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      {/* Контрол количества */}
                      <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1 border border-stone-200">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-md bg-white text-stone-600 shadow-sm hover:bg-stone-100 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="h-7 w-7 flex items-center justify-center rounded-md bg-white text-stone-600 shadow-sm hover:bg-stone-100"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Цена */}
                      <div className="text-right">
                        <p className="font-bold text-lg text-stone-900">
                          {item.product.priceUAH * item.quantity} ₴
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-stone-400">
                            {item.product.priceUAH} ₴ / шт.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: Форма + Итого */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          <form onSubmit={onSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-stone-900/5 border border-stone-100">
            <h2 className="text-xl font-bold mb-6 text-stone-900">Дані доставки</h2>
            
            <div className="space-y-4">
              {/* Имя */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Прізвище та Імʼя</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Іван Іванов"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
              </div>

              {/* Телефон */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Телефон</label>
                <input
                  required
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+380..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
              </div>

              {/* Мессенджер */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Зв'язок через</label>
                <div className="grid grid-cols-3 gap-2">
                  {["telegram", "viber", "call"].map((type) => (
                    <label key={type} className={`cursor-pointer border rounded-xl py-2 text-center text-sm font-medium transition ${form.messenger === type ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"}`}>
                      <input type="radio" name="messenger" value={type} checked={form.messenger === type} onChange={handleChange} className="sr-only" />
                      {type === "call" ? "Дзвінок" : type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-stone-100 my-4" />

              {/* Доставка */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Спосіб доставки</label>
                <select
                  name="delivery"
                  value={form.delivery}
                  onChange={handleChange}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                >
                  <option value="nova_poshta">Нова Пошта</option>
                  <option value="ukr_poshta">Укрпошта</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Місто / Село</label>
                  <input
                    required
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Київ"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Відділення / Поштомат</label>
                  <input
                    required
                    name="warehouse"
                    value={form.warehouse}
                    onChange={handleChange}
                    placeholder="№ 1"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Комментарий */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1.5">Коментар (необов'язково)</label>
                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows={2}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-none"
                />
              </div>
            </div>

            {/* ИТОГО */}
            <div className="mt-8 pt-6 border-t border-stone-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-stone-500 font-medium">До сплати:</span>
                <span className="text-3xl font-bold text-stone-900">{total} ₴</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 text-white text-lg font-bold py-4 rounded-xl hover:bg-stone-800 disabled:opacity-70 disabled:cursor-not-allowed transition shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Підтвердити замовлення"}
                {!loading && <ArrowRight size={20} />}
              </button>
              
              <p className="text-xs text-center text-stone-400 mt-4">
                Натискаючи кнопку, ви погоджуєтесь з обробкою персональних даних.
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

// Вспомогательная иконка для пустой корзины
function ShoppingBagX({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
      <path d="m9.5 13 5 5" />
      <path d="m9.5 18 5-5" />
    </svg>
  );
}