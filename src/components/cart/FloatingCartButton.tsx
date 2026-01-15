"use client";

import { ShoppingCart } from "lucide-react";
import { useCartUI, CartUIState } from "@/lib/cart-ui";
import { getCartItems } from "@/lib/cart";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation"; // 👇 1. Импортируем хук пути

export default function FloatingCartButton() {
  const toggle = useCartUI((s: CartUIState) => s.toggleCart);
  const isOpen = useCartUI((s: CartUIState) => s.open);
  const pathname = usePathname(); // 👇 2. Получаем текущий путь
  
  const [count, setCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const update = () => {
      const total = getCartItems().reduce((acc, item) => acc + item.qty, 0);
      setCount(total);
    };

    update();

    window.addEventListener("storage", update);
    window.addEventListener("cart-updated", update);
    window.addEventListener("cart:updated", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart-updated", update);
      window.removeEventListener("cart:updated", update);
    };
  }, []);

  if (!isClient) return null;
  if (isOpen) return null;

  // 👇 3. ПРОВЕРКА: Если мы на странице товара, скрываем эту кнопку
  // (чтобы она не перекрывала MobileBuyBar)
  if (pathname?.startsWith("/product/")) {
    return null;
  }

  return (
    <AnimatePresence>
      {(count > 0) && (
        <motion.button
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggle}
          className="fixed bottom-6 right-6 z-[9990] group flex items-center gap-3 rounded-full bg-stone-900/90 text-white pl-5 pr-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md border border-white/10 hover:bg-stone-800 transition-colors"
          aria-label="Відкрити кошик"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="group-hover:-rotate-12 transition-transform duration-300" />
            <span className="font-semibold text-sm pr-1">Кошик</span>
          </div>

          <AnimatePresence mode="wait">
            {count > 0 && (
              <motion.div
                key={count}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-900 shadow-md"
              >
                <span className="text-xs font-bold">{count}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}
    </AnimatePresence>
  );
}