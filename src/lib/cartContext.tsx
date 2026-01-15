"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Типы данных
export type CartItem = {
  product: {
    _id: string;
    title_ua: string;
    priceUAH: number;
    slug: string;
    images: string[];
    category?: string;
  };
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: CartItem["product"]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 1. Загрузка из localStorage при старте
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gnizde_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Cart load error", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // 2. Сохранение в localStorage при изменениях
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("gnizde_cart", JSON.stringify(items));
    }
  }, [items, loaded]);

  // --- Методы ---

  const addToCart = (product: CartItem["product"]) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.product._id === product._id);
      if (exists) {
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.product._id === productId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  // Подсчет итогов
  const total = items.reduce((acc, item) => acc + item.product.priceUAH * item.quantity, 0);
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  // Пока не загрузили из localStorage — не рендерим детей (чтобы не прыгало)
  if (!loaded) return null;

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Хук для использования в компонентах
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}