"use client";
import { create } from "zustand";

export type CartUIState = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

export const useCartUI = create<CartUIState>((set) => ({
  open: false,
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
  toggleCart: () => set((s: CartUIState) => ({ open: !s.open })),
}));