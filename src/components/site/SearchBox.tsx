"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Loader2, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Item = {
  _id: string;
  slug: string;
  title_ua: string;
  images?: string[];
  priceUAH?: number;
};

const formatUAH = (v?: number) =>
  `${String(Math.round(v || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₴`;

export default function SearchBox({
  placeholder = "Пошук…",
  variant = "desktop",
  onNavigate,
}: {
  placeholder?: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState(0);

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Хоткей "/" для фокуса
  useEffect(() => {
    if (variant !== "desktop") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  // Клик вне компонента
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Поиск с debounce
  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      setOpen(false);
      return;
    }

    let activeFlag = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
        const json = await res.json();
        if (!activeFlag) return;
        setItems(json.products || []);
        setActive(0);
        setOpen(true);
      } catch {
        if (activeFlag) setItems([]);
      } finally {
        if (activeFlag) setLoading(false);
      }
    }, 300);

    return () => {
      activeFlag = false;
      clearTimeout(timer);
    };
  }, [q]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((prev) => (prev + 1) % (items.length + 1)); // +1 для кнопки "Все результаты"
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((prev) => (prev - 1 + items.length + 1) % (items.length + 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active < items.length) {
        router.push(`/product/${items[active].slug}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(q)}`);
      }
      setOpen(false);
      onNavigate?.();
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQ("");
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* INPUT */}
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-600 transition-colors">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (!open && e.target.value.trim()) setOpen(true);
          }}
          onFocus={() => q.trim() && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-9 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 outline-none transition-all
            focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-500/10
            ${open ? "rounded-b-none border-b-transparent" : ""}
          `}
        />

        {q && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full hover:bg-stone-200 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`
              absolute left-0 right-0 z-50 overflow-hidden rounded-b-2xl border border-t-0 border-stone-200 bg-white/95 backdrop-blur-xl shadow-xl
              ${variant === 'mobile' ? 'w-full' : 'w-[120%] -left-[10%]'}
            `}
          >
            {items.length === 0 && !loading ? (
              <div className="p-6 text-center text-sm text-stone-500">
                Нічого не знайдено 😔
              </div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {items.map((item, i) => (
                  <li key={item._id} className={i === active ? "bg-amber-50" : ""}>
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => {
                        setOpen(false);
                        onNavigate?.();
                      }}
                      onMouseEnter={() => setActive(i)}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-amber-50"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100 border border-stone-100">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0]}
                            alt={item.title_ua}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Search className="h-4 w-4 text-stone-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-stone-900">
                          {item.title_ua}
                        </div>
                        <div className="text-xs text-stone-500">
                          {formatUAH(item.priceUAH)}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-amber-400 ${i === active ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                    </Link>
                  </li>
                ))}
                
                {/* Ссылка "Все результаты" */}
                <li className={active === items.length ? "bg-amber-50" : ""}>
                  <Link
                    href={`/search?q=${encodeURIComponent(q)}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    onMouseEnter={() => setActive(items.length)}
                    className="block px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    Показати всі результати
                  </Link>
                </li>
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}