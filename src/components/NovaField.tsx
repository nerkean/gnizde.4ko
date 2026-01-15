"use client";

import { useEffect, useState } from "react";

export default function NovaField({
  city,
  onSelect,
  error,
}: {
  city: string;
  onSelect: (value: string) => void;
  error?: string;
}) {
  const [cityRef, setCityRef] = useState("");
  const [branches, setBranches] = useState<{ ref: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Загружаем CityRef при изменении города
  useEffect(() => {
    if (!city || city.length < 2) return;
    const controller = new AbortController();
    fetch("/api/nova/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: city }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        const found = d?.items?.find(
          (c: any) =>
            c.name.toLowerCase().trim() === city.toLowerCase().trim()
        );
        if (found) setCityRef(found.ref);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [city]);

  // Загружаем отделения
  useEffect(() => {
    if (!cityRef) return;
    setLoading(true);
    fetch("/api/nova/warehouses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cityRef }),
    })
      .then((r) => r.json())
      .then((d) => {
        setBranches(d.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cityRef]);

  return (
    <div className="sm:col-span-2">
      <label className="mb-1 block text-sm font-medium text-stone-800">
        Відділення Нової пошти
      </label>

      {loading ? (
        <div className="w-full rounded-xl border border-stone-300 bg-white/80 px-3 py-2 text-sm text-stone-500">
          Завантаження відділень...
        </div>
      ) : branches.length > 0 ? (
        <select
          onChange={(e) => onSelect(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-200"
        >
          <option value="">Оберіть відділення</option>
          {branches.map((b) => (
            <option key={b.ref} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      ) : (
        <div className="rounded-xl border border-stone-300 bg-white/90 px-3 py-2 text-sm text-stone-500">
          {city ? "Не знайдено відділень або місто не розпізнано" : "Спершу вкажіть місто"}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
