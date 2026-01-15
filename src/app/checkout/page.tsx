"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readCartOnce } from "@/lib/cart-bridge";
import NovaDeliveryFields from "@/components/NovaDeliveryFields";

// --- Типы ---
type CartItem = {
  id: string;
  title: string;
  priceUAH: number;
  qty: number;
  image?: string;
};

// --- Хук для работы с корзиной ---
function useCartBridge() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  const loadRaw = () => {
    const data = readCartOnce();
    setItems(data);
    setReady(true);
  };

  useEffect(() => {
    loadRaw();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || /cart|bz_cart|bandazeyna/i.test(e.key)) loadRaw();
    };
    const onCustom = () => loadRaw();

    window.addEventListener("storage", onStorage);
    window.addEventListener("cart:updated", onCustom);
    window.addEventListener("cart-updated", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:updated", onCustom);
      window.removeEventListener("cart-updated", onCustom);
    };
  }, []);

  useEffect(() => {
    const needEnrich = items.some(
      (it) => !it.title || !it.priceUAH || it.priceUAH === 0 || !it.image
    );
    
    if (!ready || !items.length || !needEnrich) return;

    const controller = new AbortController();
    
    const run = async () => {
      try {
        const ids = items.map((it) => it.id);
        const res = await fetch("/api/products/mini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
          signal: controller.signal,
        });
        
        const json = await res.json();
        const serverItems = json.items || json.products || [];
        const byId = new Map<string, any>(serverItems.map((x: any) => [x.id || x._id, x]));
        
        const merged = items.map((it) => {
          const m = byId.get(it.id);
          return m
            ? {
                ...it,
                title: m.title ?? m.title_ua ?? it.title,
                priceUAH: typeof m.priceUAH === "number" && m.priceUAH > 0 ? m.priceUAH : it.priceUAH,
                image: m.image ?? (m.images?.[0]) ?? it.image,
              }
            : it;
        });

        setItems(merged);
      } catch (e) {
        console.warn("[checkout] mini fetch failed", e);
      }
    };
    
    run();
    return () => controller.abort();
  }, [ready, items.length]);

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.priceUAH) || 0) * (Number(it.qty) || 0), 0),
    [items]
  );
  
  const shipping = 0;
  const total = subtotal + shipping;

  return { items, subtotal, shipping, total, reload: loadRaw };
}

// --- Основной компонент страницы ---
export default function CheckoutPage() {
  const { items, subtotal, total } = useCartBridge();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+380");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [delivery, setDelivery] = useState<"nova" | "ukr" | "courier">("nova");
  const [branch, setBranch] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  
  // ❌ Убрали стейт agree
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const phoneFormatted = useMemo(() => phone.replace(/[^\d+]/g, ""), [phone]);

  function validate() {
    const e: Record<string, string> = {};

    if (!fullName.trim()) e.fullName = "Вкажіть ПІБ";
    if (!/^\+380\d{9}$/.test(phoneFormatted)) e.phone = "Телефон у форматі +380XXXXXXXXX";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Невалідний email";
    
    if (!city.trim() && delivery !== "courier") e.city = "Вкажіть місто";
    
    if ((delivery === "nova" || delivery === "ukr") && !branch.trim())
      e.branch = "Вкажіть номер відділення/поштомату";
    
    if (delivery === "courier" && !address.trim())
      e.address = "Вкажіть адресу для курʼєра";
    
    // ❌ Убрали проверку agree
    
    if (!items.length) e.cart = "Кошик порожній";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        items: items.map((it) => ({ id: it.id, qty: it.qty })),
        customer: { name: fullName, phone: phoneFormatted, email },
        delivery: { type: delivery, city, branch, address },
        comment,
      };

      const res = await fetch("/api/checkout/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Сталася помилка при створенні замовлення");
      }
      
      window.location.href = `/checkout/success?orderId=${json.orderId}`;

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Щось пішло не так. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container py-10 md:py-14 max-w-6xl mx-auto px-4">
      {/* Заголовок */}
      <div className="mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.32em] text-amber-700/80 font-bold">
          Оформлення
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-display font-semibold text-stone-900 tracking-tight">
          Замовлення виробів
        </h1>
        <p className="mt-3 text-stone-500 max-w-lg mx-auto leading-relaxed">
          Заповніть контактні дані та параметри доставки. <br className="hidden sm:block"/>
          Ми звʼяжемося з вами для підтвердження.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-[2.5rem] border border-amber-100 bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] p-6 sm:p-10 overflow-hidden">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-start">
            
            {/* ЛЕВАЯ КОЛОНКА — Форма */}
            <div className="space-y-10">
              
              {/* 1. Контактні дані */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-sm">1</div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Контактні дані
                  </h2>
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="ПІБ"
                    placeholder="Прізвище Імʼя"
                    value={fullName}
                    onChange={setFullName}
                    error={errors.fullName}
                    autoComplete="name"
                  />
                  <Field
                    label="Телефон"
                    placeholder="+380XXXXXXXXX"
                    value={phone}
                    onChange={(v) => setPhone(v.replace(/[^\d+]/g, ""))}
                    error={errors.phone}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  <Field
                    className="sm:col-span-2"
                    label="Email (необов'язково)"
                    placeholder="you@example.com"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    autoComplete="email"
                  />
                </div>
              </section>

              {/* 2. Доставка */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-sm">2</div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Доставка
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-stone-500">
                      Спосіб доставки
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <DeliveryPill
                        active={delivery === "nova"}
                        onClick={() => setDelivery("nova")}
                        label="Нова пошта"
                      />
                      <DeliveryPill
                        active={delivery === "ukr"}
                        onClick={() => setDelivery("ukr")}
                        label="Укрпошта"
                      />
                      <DeliveryPill
                        active={delivery === "courier"}
                        onClick={() => setDelivery("courier")}
                        label="Курʼєр"
                      />
                    </div>
                  </div>

                  <div className="bg-stone-50/50 rounded-2xl p-5 border border-stone-100 space-y-5">
                    {delivery === "nova" && (
                      <NovaDeliveryFields
                        city={city}
                        setCity={setCity}
                        branch={branch}
                        setBranch={setBranch}
                        errorCity={errors.city}
                        errorBranch={errors.branch}
                      />
                    )}

                    {delivery === "ukr" && (
                      <div className="space-y-4">
                        <Field
                           label="Місто / Населений пункт"
                           placeholder="Вкажіть місто"
                           value={city}
                           onChange={setCity}
                           error={errors.city}
                        />
                        <Field
                          label="№ відділення / поштомат / індекс"
                          placeholder="Напр.: Відділення №5 або індекс 02000"
                          value={branch}
                          onChange={setBranch}
                          error={errors.branch}
                        />
                      </div>
                    )}

                    {delivery === "courier" && (
                      <Field
                        label="Адреса доставки"
                        placeholder="Вулиця, будинок, квартира, код домофону"
                        value={address}
                        onChange={setAddress}
                        error={errors.address}
                        autoComplete="street-address"
                      />
                    )}

                    <Field
                      label="Коментар до замовлення"
                      placeholder="Наприклад: зателефонуйте перед доставкою"
                      value={comment}
                      onChange={setComment}
                      textarea
                    />
                  </div>
                </div>
              </section>

              {/* 3. Оплата (Інфо) */}
              <section>
                 <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-sm">3</div>
                  <h2 className="text-xl font-semibold text-stone-900">
                    Оплата
                  </h2>
                </div>
                <div className="rounded-2xl bg-amber-50/60 p-5 border border-amber-100 text-stone-700 flex gap-3 items-start">
                  <span className="text-2xl">ℹ️</span>
                  <div className="text-sm leading-relaxed">
                    <p className="font-bold text-stone-900 mb-1">Оплата після підтвердження</p>
                    Ми не беремо оплату на сайті автоматично. Після оформлення замовлення менеджер звʼяжеться з вами у Telegram або Viber для уточнення деталей та надасть реквізити.
                  </div>
                </div>
              </section>
            </div>

            {/* ПРАВАЯ КОЛОНКА — Итого */}
            <aside className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200/60">
                <h3 className="text-lg font-bold text-stone-900 mb-6">
                  Ваше замовлення
                </h3>

                {!items.length ? (
                  <p className="text-sm text-stone-500 py-4 text-center">Кошик порожній</p>
                ) : (
                  <ul className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-stone-200">
                    {items.map((it) => (
                      <li key={it.id} className="flex gap-3">
                        <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-white border border-stone-100 overflow-hidden relative">
                          {it.image ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                          ) : (
                             <div className="h-full w-full bg-stone-100 flex items-center justify-center text-[10px] text-stone-400">Фото</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="text-sm font-medium text-stone-900 line-clamp-2 leading-snug">
                            {it.title}
                          </div>
                          <div className="text-xs text-stone-500 mt-1">
                            {it.qty} шт. × {it.priceUAH.toLocaleString()} ₴
                          </div>
                        </div>
                        <div className="text-sm font-bold text-stone-900 self-center">
                          {(it.priceUAH * it.qty).toLocaleString()} ₴
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t border-stone-200 pt-5 space-y-3">
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Товари</span>
                    <span>{subtotal.toLocaleString("uk-UA")} ₴</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-600">
                    <span>Доставка</span>
                    <span className="text-xs bg-stone-200 px-2 py-0.5 rounded text-stone-600">За тарифами</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-stone-900 pt-2 border-t border-stone-200 mt-2">
                    <span>Разом</span>
                    <span>{total.toLocaleString("uk-UA")} ₴</span>
                  </div>
                </div>

                {/* ❌ Чекбокс полностью удален */}
                {errors.cart && (
                    <div className="mt-2 text-xs text-red-600 font-medium animate-pulse">
                      {errors.cart}
                    </div>
                )}

                {/* Кнопка */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-2xl bg-stone-900 px-5 py-4 text-sm font-bold text-white shadow-xl shadow-stone-900/10 hover:bg-stone-800 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0 disabled:shadow-none"
                >
                  {loading ? "Обробка замовлення..." : "ПІДТВЕРДИТИ ЗАМОВЛЕННЯ"}
                </button>
              </div>

              <Link
                href="/catalog"
                className="block text-center text-xs font-medium text-stone-400 hover:text-amber-700 transition"
              >
                ← Повернутися до покупок
              </Link>
            </aside>

          </div>
        </div>
      </form>
    </section>
  );
}

// --- Компоненты формы ---

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  className = "",
  textarea = false,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  textarea?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
}) {
  const baseClasses =
    "w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 hover:border-stone-300";

  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 pl-1">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${baseClasses} resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={`${baseClasses} ${error ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""}`}
        />
      )}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600 pl-1">{error}</p>}
    </div>
  );
}

function DeliveryPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-full rounded-xl border px-3 py-3 text-sm font-semibold transition-all duration-200 overflow-hidden
        ${active 
          ? "border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/20" 
          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
        }
      `}
    >
      {label}
      {active && (
         <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
      )}
    </button>
  );
}