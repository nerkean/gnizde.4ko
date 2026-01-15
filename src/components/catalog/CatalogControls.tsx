"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CatalogFilters from "./CatalogFilters";
import {
  SlidersHorizontal,
  ArrowDownWideNarrow,
  ChevronDown,
} from "lucide-react";

type Facets = {
  categories: { value: string; count: number }[];
  price: { min: number; max: number };
};

export default function CatalogControls({ facets }: { facets: Facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [open, setOpen] = useState(false);
  const sort = sp.get("sort") || "popular";

  const setSort = (value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      {/* просто содержимое внутри большого блока */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Слева: иконка + текст + select */}
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
            <ArrowDownWideNarrow className="h-4 w-4" />
          </div>

          <label className="text-sm font-medium text-stone-800 whitespace-nowrap">
            Сортування:
          </label>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={[
                "h-9 rounded-xl border border-stone-300 bg-white pl-3 pr-8 text-sm text-stone-800",
                "shadow-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-300",
                "appearance-none",
              ].join(" ")}
              aria-label="Сортування товарів"
            >
              <option value="popular">За популярністю</option>
              <option value="new">Нові спочатку</option>
              <option value="price_asc">Ціна ↑</option>
              <option value="price_desc">Ціна ↓</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-400">
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Справа: кнопка Фільтри на мобилке */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={[
            "lg:hidden inline-flex items-center gap-2 rounded-xl border border-emerald-300",
            "bg-gradient-to-r from-emerald-500 to-amber-400 px-4 py-2 text-sm font-semibold text-white",
            "shadow-[0_6px_16px_rgba(16,185,129,0.4)] transition-all hover:brightness-[1.08] active:scale-[0.97]",
          ].join(" ")}
          aria-expanded={open}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {open ? "Закрити" : "Фільтри"}
        </button>
      </div>

      {/* Мобильные фильтры */}
      {open && (
        <div className="lg:hidden mt-3 w-full animate-[fadeIn_0.25s_ease-out]">
          <CatalogFilters facets={facets} variant="mobile" />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
