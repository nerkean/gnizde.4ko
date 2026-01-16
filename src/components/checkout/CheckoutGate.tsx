"use client";

import { useEffect, useMemo, useState } from "react";
import EmptyCheckout from "./EmptyCheckout";
import { getCartItems } from "@/lib/cart";

export default function CheckoutGate({ children }: { children: React.ReactNode }) {
  const [tick, setTick] = useState(0);

  const items = useMemo(() => {
    try {
      return getCartItems();
    } catch {
      return [];
    }
  }, [tick]);

  useEffect(() => {
    const onStorage = () => setTick((x) => x + 1);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!items || items.length === 0) {
    return <EmptyCheckout />;
  }

  return <>{children}</>;
}
