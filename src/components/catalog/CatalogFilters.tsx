"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, RotateCcw, Check } from "lucide-react";

type Facets = {
  categories: { value: string; count: number }[];
  price: { min: number; max: number };
};

export default function CatalogFilters({
  facets,
  variant = "desktop",
}: {
  facets: Facets;
  variant?: "desktop" | "mobile";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [minPrice, setMinPrice] = useState(sp.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") || "");

  // availability: 'in_stock' | 'on_order' | 'out_of_stock' | null
  const [onlyInStock, setOnlyInStock] = useState(
    sp.get("availability") === "in_stock"
  );

  // Синхронизация при смене урла (назад/вперёд)
  useEffect(() => {
    setMinPrice(sp.get("minPrice") || "");
    setMaxPrice(sp.get("maxPrice") || "");
    setOnlyInStock(sp.get("availability") === "in_stock");
  }, [sp]);

  const apply = () => {
    const params = new URLSearchParams(sp.toString());

    const set = (k: string, v?: string) => {
      if (v && v.trim() !== "") params.set(k, v);
      else params.delete(k);
    };

    set("minPrice", minPrice);
    set("maxPrice", maxPrice);

    if (onlyInStock) {
      params.set("availability", "in_stock");
    } else {
      params.delete("availability");
    }

    // При изменении фильтров — всегда на первую страницу
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
  };

  const reset = () => {
    const params = new URLSearchParams(sp.toString());
    ["minPrice", "maxPrice", "availability", "page"].forEach((k) =>
      params.delete(k)
    );
    router.push(`${pathname}?${params.toString()}`);
  };

  const isDesktop = variant === "desktop";

  return (
    <aside
      className={[
        "bg-white border border-stone-200",
        isDesktop 
          ? "rounded-[2rem] p-6 sticky top-24 shadow-[0_10px_30px_rgba(0,0,0,0.04)]" 
          : "p-5 rounded-t-[2rem]",
      ].join(" ")}
    >
      {/* Заголовок + Сброс */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-900">
            <SlidersHorizontal size={18} />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider text-stone-900">
            Фільтри
          </span>
        </div>

        {(minPrice || maxPrice || onlyInStock) && (
          <button
            type="button"
            onClick={reset}
            className="group flex items-center gap-1.5 text-[11px] font-medium text-stone-400 hover:text-rose-500 transition-colors"
          >
            <RotateCcw size={12} className="group-hover:-rotate-180 transition-transform duration-500" />
            Скинути
          </button>
        )}
      </div>

      <div className="space-y-4">
        
        {/* Блок цены */}
        <div className="space-y-3 p-4 rounded-2xl bg-stone-50 border border-stone-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Ціна, ₴
          </p>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                inputMode="numeric"
                placeholder={facets?.price?.min != null ? String(facets.price.min) : "0"}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-900 placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-bold">
                MIN
              </span>
            </div>
            <div className="h-px w-2 bg-stone-300" />
            <div className="relative flex-1">
              <input
                inputMode="numeric"
                placeholder={facets?.price?.max != null ? String(facets.price.max) : ""}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-900 placeholder:text-stone-300 focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 transition-all"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-bold">
                MAX
              </span>
            </div>
          </div>
        </div>

        {/* Тумблер "Лише в наявності" */}
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl bg-stone-50 border border-stone-100 p-4 transition-colors hover:bg-stone-100 hover:border-stone-200">
          <span className="text-sm font-semibold text-stone-900">
            Лише в наявності
          </span>
          <div className="relative">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={onlyInStock}
              onChange={() => setOnlyInStock((v) => !v)}
            />
            {/* Основа свитча */}
            <div className="h-6 w-11 rounded-full bg-stone-300 transition-all peer-checked:bg-stone-900"></div>
            {/* Кружок свитча */}
            <div className="absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-5 flex items-center justify-center">
                {/* Галочка внутри кружка (появляется только когда включено) */}
                <Check size={10} className={`text-stone-900 transition-opacity ${onlyInStock ? "opacity-100" : "opacity-0"}`} strokeWidth={4} />
            </div>
          </div>
        </label>

        {/* Кнопка "Применить" */}
        <button
          type="button"
          onClick={apply}
          className="w-full rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-stone-900/10 hover:bg-stone-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          Застосувати
        </button>

      </div>
    </aside>
  );
}