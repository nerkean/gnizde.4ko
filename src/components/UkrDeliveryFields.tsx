"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search, MapPin } from "lucide-react";

type Props = {
  city: string;
  setCity: (c: string) => void;
  branch: string;
  setBranch: (b: string) => void;
  errorCity?: string;
  errorBranch?: string;
};

export default function UkrDeliveryFields({
  city,
  setCity,
  branch,
  setBranch,
  errorCity,
  errorBranch,
}: Props) {
  const [cityQuery, setCityQuery] = useState(city);
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  const cityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cityQuery || cityQuery === city) return;

    const t = setTimeout(async () => {
      setLoadingCities(true);
      try {
        const res = await fetch("/api/ukr/cities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: cityQuery }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCities(data.data);
          setShowCityList(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCities(false);
      }
    }, 600);

    return () => clearTimeout(t);
  }, [cityQuery, city]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCityList(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="space-y-4">
      
      <div className="relative" ref={cityInputRef}>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 pl-1">
          Населений пункт
        </label>
        <div className="relative">
          <input
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              if (e.target.value === "") {
                  setCity(""); 
              }
            }}
            onFocus={() => { if(cities.length) setShowCityList(true); }}
            placeholder="Введіть назву міста..."
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-10 text-sm text-stone-900 outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 ${
              errorCity ? "border-red-300" : "border-stone-200"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
            {loadingCities ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </div>
        </div>
        {errorCity && <p className="mt-1.5 text-xs font-medium text-red-600 pl-1">{errorCity}</p>}

        {showCityList && cities.length > 0 && (
          <div className="absolute left-0 right-0 top-[110%] z-20 max-h-60 overflow-auto rounded-xl border border-stone-200 bg-white shadow-xl">
            {cities.map((c: any, i: number) => (
              <button
                key={`${c.Description}_${i}`} 
                type="button"
                onClick={() => {
                  const name = c.Description;
                  setCity(name);
                  setCityQuery(name);
                  setShowCityList(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 transition-colors border-b border-stone-50 last:border-0"
              >
                {c.Description}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 pl-1">
          Поштовий індекс
        </label>
        <div className="relative">
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="Наприклад: 02000"
            maxLength={5}
            inputMode="numeric"
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-10 text-sm text-stone-900 outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 ${
              errorBranch ? "border-red-300" : "border-stone-200"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
             <MapPin size={18} />
          </div>
        </div>
        {errorBranch && <p className="mt-1.5 text-xs font-medium text-red-600 pl-1">{errorBranch}</p>}
      </div>

    </div>
  );
}