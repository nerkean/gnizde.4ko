"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Grid3X3, Menu } from "lucide-react";
import MobileMenu, { NavItem } from "@/components/MobileMenu";
import SearchBox from "@/components/site/SearchBox";
import Image from "next/image";

const NAV: NavItem[] = [
  { href: "/", label: "Головна", icon: <Home size={16} /> },
  { href: "/catalog", label: "Каталог", icon: <Grid3X3 size={16} /> },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="
        fixed inset-x-0 top-0 z-50
        bg-white/80 backdrop-blur-xl
        shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        border-b border-amber-100/70
      "
    >
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300" />

      <div className="container flex items-center justify-between py-4 sm:py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-[17px] font-bold text-stone-900 group"
        >
          <div className="relative transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
            <Image
              src="/images/logo.svg"
              alt="Gnizde.4ko"
              width={50}
              height={50}
              priority
              className="drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
            />
          </div>
          <span className="font-display tracking-wide text-[17px] text-[#72451b] transition-colors group-hover:text-amber-700">
            Gnizde.4ko
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1.5 rounded-2xl border border-amber-100/60 bg-white/70 px-2 py-1 shadow-sm backdrop-blur-sm">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/catalog" &&
                (pathname.startsWith("/catalog") ||
                  pathname.startsWith("/product/")));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex items-center gap-2 px-4 py-2 text-[15px] font-medium transition-all duration-300 rounded-xl
                ${
                  active
                    ? "text-stone-900 bg-amber-50/70"
                    : "text-stone-700 hover:text-stone-900 hover:bg-amber-50/40"
                }`}
              >
                <span className="opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-active-line"
                    className="absolute -bottom-1 left-1/2 h-[2px] w-5 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block relative group">
            <div className="w-[220px] group-focus-within:w-[300px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <SearchBox />
            </div>
          </div>

          <button
            aria-label="Меню"
            onClick={() => setMenuOpen(true)}
            className="lg:hidden flex items-center justify-center rounded-xl border border-stone-200 bg-white/80 p-2 text-stone-700 hover:bg-white/90 shadow-sm transition active:scale-95"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={NAV}
        currentPath={pathname}
      />
    </header>
  );
}