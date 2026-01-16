"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, ArrowRight, ShieldCheck, Package, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function EmptyCheckout() {
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setRecommended((data?.products || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/5 shadow-sm">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_0%_0%,rgba(16,185,129,0.08),transparent_60%),radial-gradient(70%_70%_at_100%_100%,rgba(16,185,129,0.05),transparent_55%)]" />

          <div className="p-8 sm:p-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                  Кошик порожній
                </h1>
                <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-stone-700">
                  Додайте товари у кошик, а потім поверніться сюди, щоб оформити замовлення.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    Перейти до каталогу
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <div className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-[13px] text-stone-700">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    Доставка Новою Поштою
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/5 bg-white/70 p-4 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Безпечна оплата через LiqPay
            </div>
          </div>
        </div>

        {recommended.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-5 text-lg sm:text-xl font-semibold text-zinc-900">
              Рекомендовані товари
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {recommended.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
