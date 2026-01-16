// src/app/fonts.ts
import { Montserrat, Inter } from "next/font/google";

export const display = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const sans = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
