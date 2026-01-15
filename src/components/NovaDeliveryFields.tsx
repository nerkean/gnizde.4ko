"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search } from "lucide-react";

type Props = {
  city: string;
  setCity: (c: string) => void;
  branch: string;
  setBranch: (b: string) => void;
  errorCity?: string;
  errorBranch?: string;
};

export default function NovaDeliveryFields({
  city,
  setCity,
  branch,
  setBranch,
  errorCity,
  errorBranch,
}: Props) {
  // --- Состояние городов ---
  const [cityQuery, setCityQuery] = useState(city);
  const [cityRef, setCityRef] = useState(""); // Ref выбранного города
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  // --- Состояние отделений ---
  const [branchQuery, setBranchQuery] = useState(branch);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [showBranchList, setShowBranchList] = useState(false);

  const cityInputRef = useRef<HTMLInputElement>(null);
  const branchInputRef = useRef<HTMLInputElement>(null);

  // 1. Поиск городов (Debounce)
  useEffect(() => {
    if (!cityQuery || cityQuery === city) return; // Если не меняли или уже выбрано
    
    const t = setTimeout(async () => {
      setLoadingCities(true);
      try {
        const res = await fetch("/api/nova/cities", {
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
    }, 500);

    return () => clearTimeout(t);
  }, [cityQuery, city]);

  // 2. Поиск отделений (Debounce)
  useEffect(() => {
    if (!cityRef) {
        setBranches([]); 
        return;
    }
    
    setLoadingBranches(true);
    // Загружаем отделения сразу при выборе города
    fetch("/api/nova/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityRef, query: branchQuery }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBranches(data.data);
        }
      })
      .finally(() => setLoadingBranches(false));

  }, [cityRef, branchQuery]); // Перезагружаем при смене города или поиске отделения

  // Обработчик клика вне списков (закрытие)
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCityList(false);
      }
      if (branchInputRef.current && !branchInputRef.current.contains(e.target as Node)) {
        setShowBranchList(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div className="space-y-4">
      
      {/* --- ПОЛЕ ГОРОДА --- */}
      <div className="relative" ref={cityInputRef}>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 pl-1">
          Місто (Нова Пошта)
        </label>
        <div className="relative">
          <input
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              if (e.target.value === "") {
                  setCity(""); 
                  setCityRef("");
                  setBranch("");
                  setBranchQuery("");
              }
            }}
            onFocus={() => {
                if(cities.length > 0) setShowCityList(true);
            }}
            placeholder="Введіть назву міста..."
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-10 text-sm text-stone-900 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 ${
              errorCity ? "border-red-300" : "border-stone-200"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
            {loadingCities ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </div>
        </div>
        {errorCity && <p className="mt-1.5 text-xs font-medium text-red-600 pl-1">{errorCity}</p>}

        {/* Выпадающий список городов */}
        {showCityList && cities.length > 0 && (
          <div className="absolute left-0 right-0 top-[110%] z-20 max-h-60 overflow-auto rounded-xl border border-stone-200 bg-white shadow-xl">
            {cities.map((c: any) => (
              <button
                key={c.Ref}
                type="button"
                onClick={() => {
                  const name = c.Description; // Или DescriptionRu
                  setCity(name);
                  setCityQuery(name);
                  setCityRef(c.Ref);
                  setShowCityList(false);
                  // Сброс отделения
                  setBranch("");
                  setBranchQuery("");
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 transition-colors"
              >
                {c.Description}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- ПОЛЕ ОТДЕЛЕНИЯ --- */}
      <div className="relative" ref={branchInputRef}>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-stone-500 pl-1">
          Відділення / Поштомат
        </label>
        <div className="relative">
          <input
            value={branchQuery}
            disabled={!cityRef}
            onChange={(e) => {
                setBranchQuery(e.target.value);
                setShowBranchList(true);
            }}
            onFocus={() => setShowBranchList(true)}
            placeholder={!cityRef ? "Спочатку оберіть місто" : "Введіть номер або адресу..."}
            className={`w-full rounded-xl border bg-white px-4 py-3 pr-10 text-sm text-stone-900 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:bg-stone-100 disabled:text-stone-400 ${
              errorBranch ? "border-red-300" : "border-stone-200"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
             {loadingBranches ? <Loader2 className="animate-spin" size={18} /> : null}
          </div>
        </div>
        {errorBranch && <p className="mt-1.5 text-xs font-medium text-red-600 pl-1">{errorBranch}</p>}

        {/* Выпадающий список отделений */}
        {showBranchList && branches.length > 0 && (
          <div className="absolute left-0 right-0 top-[110%] z-20 max-h-60 overflow-auto rounded-xl border border-stone-200 bg-white shadow-xl">
            {branches
              .filter(b => b.Description.toLowerCase().includes(branchQuery.toLowerCase()))
              .map((b: any) => (
              <button
                key={b.Ref}
                type="button"
                onClick={() => {
                  setBranch(b.Description);
                  setBranchQuery(b.Description);
                  setShowBranchList(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 transition-colors border-b border-stone-50 last:border-0"
              >
                {b.Description}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}