"use client";

import CartDrawer from "@/components/cart/CartDrawer";
import FloatingCartButton from "@/components/cart/FloatingCartButton";

export default function CartRoot() {
  return (
    <>
      <FloatingCartButton />
      <CartDrawer />
    </>
  );
}