"use client";

import { useEffect, useRef } from "react";
import { notifyCartUpdated } from "@/lib/cart-bridge";

function forceClearCart() {
  console.log("🧹 Выполняем очистку корзины...");
  
  const KEYS_TO_KILL = [
    "cart", 
    "bz_cart", 
    "shopping_cart", 
    "bandazeyna_cart",
    "checkout"
  ];

  try {
    for (const k of KEYS_TO_KILL) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    }

    Object.keys(localStorage).forEach((key) => {
      if (key.toLowerCase().includes("cart")) {
        localStorage.removeItem(key);
      }
    });

    document.cookie = "cart=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    notifyCartUpdated();
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cart-updated"));
    window.dispatchEvent(new Event("cart:updated"));
    
    console.log("✅ Корзина очищена");
  } catch (e) {
    console.error("Ошибка при очистке:", e);
  }
}

export default function ClearCartOnSuccess({ orderId }: { orderId: string }) {
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    
    const sessionKey = `cleared_order_${orderId}`;
    if (sessionStorage.getItem(sessionKey)) {
      console.log("ℹ️ Для этого заказа корзина уже была очищена ранее.");
      return;
    }

    forceClearCart();
    
    sessionStorage.setItem(sessionKey, "true");
    processedRef.current = true;

  }, [orderId]);

  return null;
}