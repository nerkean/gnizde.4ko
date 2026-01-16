"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 overflow-hidden bg-[#FAFAF9]">
      
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/images/noise.png')] mix-blend-overlay pointer-events-none" />

      <div className="pointer-events-none absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-amber-100/50 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-stone-200/50 blur-[100px]" />

      <div className="relative z-10 flex flex-col items-center text-center">

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[120px] sm:text-[180px] md:text-[220px] font-display font-bold leading-none text-stone-900/[0.03] select-none"
        >
          404
        </motion.h1>

        <div className="-mt-12 sm:-mt-20 md:-mt-28 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
              Сторінку не знайдено
            </h2>
            <p className="mt-3 text-stone-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Схоже, ви заблукали в нашому солом’яному світі. 
              Ця сторінка зникла або ніколи не існувала.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link
              href="/catalog"
              className="
                inline-flex items-center gap-2 rounded-xl 
                bg-stone-900 px-6 py-3 
                text-white text-sm font-medium
                shadow-xl shadow-stone-900/10 
                hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all
              "
            >
              <ShoppingBag size={18} />
              Перейти до каталогу
            </Link>

            <Link
              href="/"
              className="
                inline-flex items-center gap-2 rounded-xl 
                bg-white border border-stone-200 px-6 py-3 
                text-stone-600 text-sm font-medium
                hover:bg-stone-50 hover:text-stone-900 hover:border-stone-300 transition-all
              "
            >
              <ArrowLeft size={18} />
              На головну
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}