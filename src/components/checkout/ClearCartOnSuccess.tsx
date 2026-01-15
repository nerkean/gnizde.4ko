"use client";

import { useEffect, useRef } from "react";
import { notifyCartUpdated } from "@/lib/cart-bridge";

// Функция жесткой очистки
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
    // 1. Удаляем точные ключи
    for (const k of KEYS_TO_KILL) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    }

    // 2. Удаляем всё, что похоже на корзину (на всякий случай)
    Object.keys(localStorage).forEach((key) => {
      if (key.toLowerCase().includes("cart")) {
        localStorage.removeItem(key);
      }
    });

    // 3. Сбрасываем куки (если вдруг корзина в куках)
    document.cookie = "cart=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // 4. Уведомляем все вкладки и компоненты
    notifyCartUpdated(); // Твоя утилита
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
    // Защита от двойного срабатывания React StrictMode
    if (processedRef.current) return;
    
    // Проверяем, не чистили ли мы уже корзину для ЭТОГО заказа в этой сессии
    // (чтобы если юзер обновит страницу успеха, мы не стерли новую корзину, если он уже успел что-то добавить)
    const sessionKey = `cleared_order_${orderId}`;
    if (sessionStorage.getItem(sessionKey)) {
      console.log("ℹ️ Для этого заказа корзина уже была очищена ранее.");
      return;
    }

    // Запускаем очистку
    forceClearCart();
    
    // Помечаем, что очистка прошла
    sessionStorage.setItem(sessionKey, "true");
    processedRef.current = true;

  }, [orderId]);

  return null;
}