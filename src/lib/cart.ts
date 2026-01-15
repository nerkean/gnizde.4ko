"use client";

export type CartItem = { id: string; qty: number };
const KEY = "pavuk_cart";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}

export function getCartItems(): CartItem[] {
  return read();
}

export function addToCart(id: string, qty = 1) {
  const items = read();
  const i = items.find((x) => x.id === id);
  if (i) i.qty = Math.min(99, i.qty + qty);
  else items.push({ id, qty: Math.max(1, Math.min(99, qty)) });
  write(items);
}

export function setQty(id: string, qty: number) {
  const items = read();
  const i = items.find((x) => x.id === id);
  if (i) {
    i.qty = Math.max(1, Math.min(99, qty | 0));
    write(items);
  }
}

export function removeFromCart(id: string) {
  write(read().filter((x) => x.id !== id));
}

export function clearCart() {
  write([]);
}