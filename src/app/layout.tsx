import "./globals.css";
import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import CartRoot from "@/components/cart/CartRoot";

// Шрифты через next/font (автоматически подставляются в CSS)
const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});
const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gnizde.4ko",
  description: "lorem ipsum",

  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: ["/favicon/favicon.ico"],
    other: [
      {
        rel: "manifest",
        url: "/favicon/site.webmanifest"
      }
    ]
  },

  // Дополнительное поле из генератора
  appleWebApp: {
    title: "Gnizde.4ko",
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${montserrat.variable} ${roboto.variable}`}>
      <head>
        {/* ⚡️ Улучшаем LCP и FCP */}
        {/* Предсоединение к источникам Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* 💨 Предзагрузка локального основного шрифта (если есть) */}
        <link
          rel="preload"
          as="font"
          href="/_next/static/media/ccee61546c0358b7-s.ddf605a8.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Можно добавить фавикон или meta-color */}
        <meta name="theme-color" content="#f7f4ee" />
      </head>

      <body className="font-sans-custom bg-[#F7F4EE] text-stone-900 antialiased">
        <Header />
        <main className="pt-[72px] sm:pt-[80px]">{children}</main>
        <CartRoot />
        <Footer />
      </body>
    </html>
  );
}
