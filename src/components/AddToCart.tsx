"use client";

import { addToCart } from "@/lib/cart";
import { useCartUI } from "@/lib/cart-ui";
import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notifyCartUpdated } from "@/lib/cart-bridge";
import { ShoppingBag, Loader2, Plus } from "lucide-react";

export default function AddToCart({
  productId,
  qty = 1,
  className = "",
}: {
  productId: string | undefined;
  qty?: number;
  className?: string;
}) {
  const openCart = useCartUI((s) => s.openCart);
  const [isLoading, setIsLoading] = useState(false);

  const onClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); // На всякий случай, чтобы не переходило по ссылке, если кнопка внутри Link
    if (!productId || isLoading) return;

    setIsLoading(true);

    try {
      // Имитация задержки для красоты (опционально, чтобы пользователь успел увидеть спиннер)
      // await new Promise(r => setTimeout(r, 300)); 

      await addToCart(productId, qty);
      notifyCartUpdated();
      openCart();
    } catch (e) {
      console.error("[AddToCart] failed", e);
    } finally {
      setIsLoading(false);
    }
  }, [productId, qty, openCart, isLoading]);

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      disabled={!productId || isLoading}
      className={`
        relative flex items-center justify-center gap-2 overflow-hidden rounded-xl 
        bg-stone-900 px-6 py-3 text-white shadow-md transition-all duration-300
        hover:bg-stone-800 hover:shadow-lg hover:shadow-stone-900/20
        disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0
        font-bold tracking-wide text-sm font-sans
        ${className}
      `}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center bg-stone-900"
          >
            <Loader2 className="h-5 w-5 animate-spin text-stone-200" />
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <ShoppingBag size={18} strokeWidth={2.5} />
              <div className="absolute -right-1 -top-1">
                 <Plus size={10} strokeWidth={4} className="text-amber-400" />
              </div>
            </div>
            <span>Додати в кошик</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}