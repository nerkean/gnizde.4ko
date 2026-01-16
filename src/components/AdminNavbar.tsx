"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut,
  ExternalLink,
  FileText,
  Menu
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Огляд", exact: true, icon: LayoutDashboard },
  { href: "/admin/orders", label: "Замовлення", icon: Package },
  { href: "/admin/products", label: "Товари", icon: ShoppingBag },
  { href: "/admin/content", label: "Контент", icon: FileText },
  { href: "/admin/settings", label: "Налаштування", icon: Settings },
];

export default function AdminNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* ЛІВА ЧАСТИНА: Лого + Навігація */}
        <div className="flex items-center gap-8 overflow-hidden">
          
          {/* Логотип */}
          <Link href="/admin" className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition">
            <span className="font-bold text-stone-900 tracking-tight hidden md:block">
              Адмін-панель
            </span>
          </Link>

          {/* Розділювач (тільки десктоп) */}
          <div className="h-6 w-px bg-stone-200 hidden md:block shrink-0"></div>

          {/* Навігація */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-fade-right">
            {navItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);
              
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? "bg-stone-100 text-stone-900" 
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                    }
                  `}
                >
                  <Icon 
                    size={16} 
                    className={`transition-colors ${isActive ? "text-stone-900" : "text-stone-400 group-hover:text-stone-600"}`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ПРАВА ЧАСТИНА: Дії */}
        <div className="flex items-center gap-2 shrink-0 pl-4 bg-gradient-to-l from-white/80 via-white/50 to-transparent">
          
          <a 
            href="/" 
            target="_blank" 
            title="Відкрити сайт"
            className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-900 px-3 py-2 rounded-lg hover:bg-stone-100 transition border border-transparent hover:border-stone-200"
          >
            <span>На сайт</span>
            <ExternalLink size={14} />
          </a>

          <form method="POST" action="/api/admin/logout">
            <button 
              type="submit" 
              className="flex items-center justify-center h-9 w-9 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Вийти"
            >
              <LogOut size={18} />
            </button>
          </form>

        </div>

      </div>
    </header>
  );
}