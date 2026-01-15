"use client";

import { useEffect, useState } from "react";

export default function NovaDeliveryFields({
  city,
  setCity,
  branch,
  setBranch,
  errorCity,
  errorBranch,
}: {
  city: string;
  setCity: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
  errorCity?: string;
  errorBranch?: string;
}) {
  const [cityList, setCityList] = useState<{ name: string; ref: string }[]>([]);
  const [showCityList, setShowCityList] = useState(false);
  const [cityRef, setCityRef] = useState("");

  const [branchList, setBranchList] = useState<{ name: string; ref: string }[]>([]);
  const [showBranchList, setShowBranchList] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // 🔹 Поиск городов (autocomplete)
  useEffect(() => {
    if (city.length < 2) {
      setCityList([]);
      return;
    }

    const controller = new AbortController();
    fetch("/api/nova/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: city }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        setCityList(d.items || []);
        setShowCityList(true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [city]);

  // 🔹 При выборе города — загружаем отделения
  useEffect(() => {
    if (!cityRef) return;
    setLoadingBranches(true);
    fetch("/api/nova/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityRef }),
    })
      .then((r) => r.json())
      .then((d) => {
        setBranchList(d.items || []);
      })
      .catch(() => {})
      .finally(() => setLoadingBranches(false));
  }, [cityRef]);

  const handleCitySelect = (name: string, ref: string) => {
    setCity(name);
    setCityRef(ref);
    setShowCityList(false);
    setBranch("");
  };

  const handleBranchSelect = (name: string) => {
    setBranch(name);
    setShowBranchList(false);
  };

  return (
    <>
      {/* --- Поле города --- */}
      <div className="relative sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-stone-800">Місто</label>
        <input
          type="text"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setShowCityList(true);
          }}
          placeholder="Напр.: Київ"
          className="w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
        />
        {errorCity && <p className="mt-1 text-xs text-red-600">{errorCity}</p>}

        {showCityList && cityList.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg">
            {cityList.map((c) => (
              <li
                key={c.ref}
                onClick={() => handleCitySelect(c.name, c.ref)}
                className="px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer transition"
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Поле отделения --- */}
      <div className="relative sm:col-span-2">
        <label className="mb-1 block text-sm font-medium text-stone-800">
          Відділення / поштомат
        </label>
        <input
          type="text"
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value);
            setShowBranchList(true);
          }}
          placeholder={loadingBranches ? "Завантаження..." : "Напр.: Відділення №12"}
          className="w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
        />
        {errorBranch && <p className="mt-1 text-xs text-red-600">{errorBranch}</p>}

        {showBranchList && branchList.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-stone-200 bg-white shadow-lg">
            {branchList
              .filter((b) =>
                b.name.toLowerCase().includes(branch.toLowerCase())
              )
              .map((b) => (
                <li
                  key={b.ref}
                  onClick={() => handleBranchSelect(b.name)}
                  className="px-3 py-2 text-sm hover:bg-emerald-50 cursor-pointer transition"
                >
                  {b.name}
                </li>
              ))}
          </ul>
        )}
      </div>
    </>
  );
}
