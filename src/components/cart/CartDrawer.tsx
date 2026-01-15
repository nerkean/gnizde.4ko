"use client";

import { useCartUI } from "@/lib/cart-ui";
import { clearCart, getCartItems, removeFromCart, setQty } from "@/lib/cart";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

// Тип данных, которые приходят с API
export type MiniProduct = {
  _id: string;
  title_ua: string;
  priceUAH: number;
  images?: string[];
  slug?: string;
};

export default function CartDrawer() {
  const open = useCartUI((s) => s.open);
  const close = useCartUI((s) => s.closeCart);

  const [products, setProducts] = useState<MiniProduct[]>([]);
  const [items, setItems] = useState<{ id: string; qty: number }[]>([]);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // 1. Читаем корзину
  useEffect(() => {
    const update = () => setItems(getCartItems());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("cart-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart-updated", update);
    };
  }, []);

  // 2. Блокируем скролл фона
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollY}px`;
      return () => {
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // 3. Загружаем данные о товарах
  useEffect(() => {
    if (!open || items.length === 0) return;

    // Ищем ID, данных о которых у нас еще нет
    const idsToFetch = items
      .map((i) => i.id)
      .filter((id) => !products.find((p) => p._id === id));

    if (idsToFetch.length === 0) return;

    fetch("/api/products/mini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idsToFetch }),
    })
      .then((r) => r.json())
      .then((data) => {
        // 👇 ИСПРАВЛЕНИЕ: читаем data.items вместо data.products
        if (data && Array.isArray(data.items)) {
          setProducts((prev) => {
            const newMap = new Map(prev.map((p) => [p._id, p]));
            
            // Маппим пришедшие данные (id -> _id, title -> title_ua)
            data.items.forEach((item: any) => {
              newMap.set(item.id, {
                _id: item.id,
                title_ua: item.title,
                priceUAH: item.priceUAH,
                images: item.image ? [item.image] : [],
                slug: item.slug,
              });
            });
            return Array.from(newMap.values());
          });
        }
      })
      .catch((e) => console.error("Error fetching cart products:", e));
  }, [open, items]); // removed 'products' from dependency to avoid loop, logical check inside handles it

  // Создаем карту для быстрого доступа
  const map = useMemo(() => {
    const m = new Map<string, MiniProduct>();
    for (const p of products) m.set(p._id, p);
    return m;
  }, [products]);

  // Собираем итоговые строки
  const lines = items.map((i) => {
    const p = map.get(i.id);
    const price = p?.priceUAH ?? 0;
    return {
      id: i.id,
      qty: i.qty,
      price,
      lineTotal: price * i.qty,
      // Если товара еще нет в загруженных, показываем заглушку
      title: p ? p.title_ua : "Завантаження...", 
      image: p?.images?.[0] || "",
      slug: p?.slug || "#",
      loading: !p, // Флаг загрузки
    };
  });

  const total = lines.reduce((s, l) => s + l.lineTotal, 0);

  if (typeof window === "undefined") return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            onClick={close}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Drawer */}
          <motion.aside
            className="fixed right-0 top-0 z-[70] h-[100dvh] w-full max-w-[420px] bg-white shadow-2xl flex flex-col border-l border-stone-100"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 px-6 py-5 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 leading-none">Ваш кошик</h2>
                  <span className="text-xs text-stone-500">{items.length} товари</span>
                </div>
              </div>
              <button
                onClick={close}
                className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-stone-200">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="h-24 w-24 rounded-full bg-stone-50 flex items-center justify-center mb-2">
                    <ShoppingBag className="h-10 w-10 text-stone-300" />
                  </div>
                  <h3 className="text-lg font-medium text-stone-900">Кошик порожній</h3>
                  <p className="text-stone-500 max-w-[200px]">
                    Перегляньте наш каталог, щоб знайти щось особливе
                  </p>
                  <Link
                    href="/catalog"
                    onClick={close}
                    className="mt-4 rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition"
                  >
                    Перейти до каталогу
                  </Link>
                </div>
              ) : (
                <motion.ul
                  className="space-y-6"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
                  }}
                >
                  {lines.map((l) => (
                    <motion.li
                      key={l.id}
                      variants={{
                        hidden: { opacity: 0, x: 20 },
                        show: { opacity: 1, x: 0 },
                      }}
                      className="group flex gap-4"
                    >
                      {/* Картинка */}
                      <Link 
                        href={l.slug !== "#" ? `/product/${l.slug}` : "#"} 
                        onClick={l.slug !== "#" ? close : undefined}
                        className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50 ${l.loading ? 'animate-pulse' : ''}`}
                      >
                        {l.image ? (
                          <img
                            src={l.image}
                            alt={l.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-stone-300">
                            {l.loading ? "" : "No photo"}
                          </div>
                        )}
                      </Link>

                      {/* Инфо */}
                      <div className="flex flex-1 flex-col justify-between py-1">
                        <div className="flex justify-between gap-2">
                          <Link 
                            href={l.slug !== "#" ? `/product/${l.slug}` : "#"}
                            onClick={l.slug !== "#" ? close : undefined}
                            className={`font-medium text-stone-900 line-clamp-2 hover:text-amber-700 transition leading-snug ${l.loading ? 'animate-pulse bg-stone-100 text-transparent rounded w-3/4' : ''}`}
                          >
                            {l.title}
                          </Link>
                          <button
                            onClick={() => {
                              removeFromCart(l.id);
                              window.dispatchEvent(new Event("cart-updated")); 
                            }}
                            className="text-stone-300 hover:text-red-500 transition -mt-1 -mr-1 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className={`text-sm font-semibold text-stone-900 ${l.loading ? 'animate-pulse bg-stone-100 text-transparent rounded w-16' : ''}`}>
                            {l.price.toLocaleString("uk-UA")} ₴
                          </div>

                          {/* Счетчик */}
                          <div className="flex items-center rounded-lg border border-stone-200 bg-white p-0.5 shadow-sm">
                            <button
                              onClick={() => {
                                setQty(l.id, Math.max(1, l.qty - 1));
                                window.dispatchEvent(new Event("cart-updated"));
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 transition"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-stone-900">
                              {l.qty}
                            </span>
                            <button
                              onClick={() => {
                                setQty(l.id, Math.min(99, l.qty + 1));
                                window.dispatchEvent(new Event("cart-updated"));
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 transition"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 && (
              <div className="border-t border-stone-100 bg-stone-50/50 p-6 space-y-4">
                <div className="flex items-center justify-between text-lg font-medium">
                  <span className="text-stone-600">Разом</span>
                  <span className="text-2xl font-bold text-stone-900">
                    {total.toLocaleString("uk-UA")} ₴
                  </span>
                </div>

                <div className="grid gap-3">
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-xl bg-stone-900 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-stone-900/10 hover:bg-stone-800 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                  >
                    Оформити замовлення
                  </Link>
                  <button
                     onClick={() => {
                        clearCart();
                        window.dispatchEvent(new Event("cart-updated"));
                     }}
                     className="w-full text-xs text-stone-400 hover:text-stone-600 underline decoration-stone-300 underline-offset-4"
                  >
                     Очистити кошик
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}