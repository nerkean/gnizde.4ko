"use client";

import AddToCart from "@/components/AddToCart";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileBuyBar({
  productId,
  priceText,
}: {
  productId: string;
  priceText: string;
}) {
  // Показываем панель только когда проскроллили немного вниз (чтобы не дублировать кнопку сверху)
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Показываем, если прокрутили больше 300px (пролистали первое фото)
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-stone-200 p-4 pb-safe lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        >
          {/* pb-safe нужен для iPhone (чтобы не наезжать на черную полоску Home) 
              для этого в tailwind.config.ts должен быть плагин или класс padding-bottom: env(safe-area-inset-bottom)
              если его нет, просто добавим дополнительный padding снизу вручную классом pb-6
          */}
          <div className="flex items-center gap-4 pb-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-stone-500 font-bold tracking-wider">
                Ціна
              </span>
              <span className="text-xl font-bold text-stone-900 leading-none">
                {priceText}
              </span>
            </div>
            
            <div className="flex-1">
              <AddToCart 
                productId={productId} 
                className="w-full h-12 text-sm shadow-lg shadow-amber-900/10" 
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}