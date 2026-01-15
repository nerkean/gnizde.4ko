// src/lib/cart-bridge.ts
export type RawCartItem =
  | { id?: string; productId?: string; title?: string; priceUAH?: number; qty?: number; quantity?: number; image?: string }
  | Record<string, any>;

export type CartItem = {
  id: string;
  title: string;
  priceUAH: number;
  qty: number;
  image?: string;
};

function parseJSON<T>(v: string | null): T | null {
  if (!v) return null;
  try { return JSON.parse(v) as T; } catch { return null; }
}

// ✅ type guard: если вернуло true — arr точно RawCartItem[]
function looksLikeCartArray(arr: unknown): arr is RawCartItem[] {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return (
    arr.some((x) => x && ( (x as any).id || (x as any).productId )) &&
    arr.some((x) => x && ( (x as any).qty != null || (x as any).quantity != null ))
  );
}

function scoreKeyName(key: string): number {
  const k = key.toLowerCase();
  let s = 0;
  if (k.includes("cart")) s += 5;
  if (k.includes("basket")) s += 3;
  if (k.includes("checkout")) s += 2;
  if (k.includes("store")) s += 1;
  if (k.includes("bz") || k.includes("bandazeyna")) s += 2;
  return s;
}

function normalizeItems(raw: RawCartItem[]): CartItem[] {
  return raw
    .map((it) => {
      const id = (it.id ?? it.productId ?? "").toString();
      const qty = Number(it.qty ?? it.quantity ?? 1);
      const priceUAH = Number((it as any).priceUAH ?? 0);
      const title = (it as any).title ?? "Товар";
      const image = (it as any).image;
      if (!id) return null;
      return { id, qty: qty > 0 ? qty : 1, priceUAH: isFinite(priceUAH) ? priceUAH : 0, title, image };
    })
    .filter(Boolean) as CartItem[];
}

/** Сканирует ВСЕ ключи localStorage и sessionStorage, выбирая самый правдоподобный массив корзины. */
export function readCartOnce(): CartItem[] {
  if (typeof window === "undefined") return [];

  // 1) window.__CART__
  const wc = (window as any).__CART__;
  if (looksLikeCartArray(wc)) {
    return normalizeItems(wc);
  }

  // 2) localStorage — проходим по всем ключам
  const candidates: { key: string; data: RawCartItem[]; score: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    const parsed = parseJSON<unknown>(localStorage.getItem(key));
    if (looksLikeCartArray(parsed)) {
      candidates.push({ key, data: parsed, score: scoreKeyName(key) + parsed.length });
    }
  }

  // 3) sessionStorage — тоже пробуем
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)!;
    const parsed = parseJSON<unknown>(sessionStorage.getItem(key));
    if (looksLikeCartArray(parsed)) {
      candidates.push({ key, data: parsed, score: scoreKeyName(key) + parsed.length - 1 }); // чуть ниже приоритет
    }
  }

  if (candidates.length) {
    candidates.sort((a, b) => b.score - a.score);
    return normalizeItems(candidates[0].data);
  }

  return [];
}

/** Вызывай после любого изменения корзины на клиенте, чтобы checkout обновился без перезагрузки. */
export function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }
}
