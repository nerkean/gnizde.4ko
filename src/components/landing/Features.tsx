"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

type FeatureItem = { icon?: string; title?: string; text?: string };

export default function Features({
  label,
  heading,
  items,
}: {
  label?: string;
  heading?: string;
  items?: FeatureItem[];
}) {
  const data = useMemo<FeatureItem[]>(
    () =>
      (items && items.length ? items : [
        { icon: "🌾", title: "Натуральні матеріали", text: "Використовуємо лише екологічно чисту солому та натуральні тканини." },
        { icon: "🧶", title: "Ручна робота", text: "Кожен вузлик та елемент створено руками майстра з любов'ю." },
        { icon: "✨", title: "Унікальні дизайни", text: "Поєднання давніх традицій з естетикою сучасного мінімалізму." },
        { icon: "🛡️", title: "Надійна упаковка", text: "Гарантуємо, що виріб доїде цілим, або ми повернемо кошти." },
      ]).slice(0, 4),
    [items]
  );

  const labelText = label || "Переваги";
  const headingText = heading || "Чому обирають Gnizde.4ko";

  return (
    <div className="w-full">

      <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-700 mb-3">
          {labelText}
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-stone-900 leading-tight">
          {headingText}
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-[2rem] bg-stone-50 border border-stone-100 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-stone-900/5 hover:-translate-y-1"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              {f.icon || "✨"}
            </div>

            <h3 className="mb-3 text-lg font-bold text-stone-900">
              {f.title}
            </h3>
            
            <p className="text-sm sm:text-[15px] leading-relaxed text-stone-600">
              {f.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}