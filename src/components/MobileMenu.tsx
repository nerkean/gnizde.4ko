"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { createPortal } from "react-dom";

export type NavItem = { href: string; label: string; icon?: React.ReactNode };

// Группы каталога
const CATALOG_GROUPS = [
  { key: "pavuky", title: "Павуки" },
  { key: "vinky", title: "Вінки" },
  { key: "inshe", title: "Інше" },
] as const;

// Подкатегории по группам
const CATALOG_SUB: Record<string, { slug: string; title: string }[]> = {
  pavuky: [
    { slug: "pavuky-rizdvo", title: "Павуки до Різдва" },
    { slug: "vyshyti-pavuky", title: "Вишиті павуки" },
    { slug: "pavuky-velykden", title: "Павуки великодні" },
    { slug: "nabory-pavukiv", title: "Набори павуків" },
    { slug: "nabory-vyshytykh-pavukiv", title: "Набори вишитих павуків" },
  ],
  vinky: [
    { slug: "vinky-zlak", title: "Вінки зі злаків" },
    { slug: "vinky-rizdviani", title: "Вінки різдвяні" },
    { slug: "vinky-shkarlupa", title: "Вінки зі шкаралупи яєць" },
  ],
  inshe: [
    { slug: "snopy-didukhy", title: "Снопи та дідухи" },
    { slug: "vyroby-sino", title: "Вироби з сіна" },
    { slug: "kolosky-soloma-sino", title: "Колоски, солома, сіно" },
  ],
};

type MenuLevel = "root" | "catalog-groups" | "catalog-sub";

export default function MobileMenu({
  open,
  onClose,
  items,
  currentPath,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  currentPath: string;
}) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);

  const [menuLevel, setMenuLevel] = useState<MenuLevel>("root");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // блокировка скролла
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [open]);

  // при открытии меню всегда начинаем с корневого уровня
  useEffect(() => {
    if (open) {
      setMenuLevel("root");
      setSelectedGroup(null);
    }
  }, [open]);

  // мягкий iOS-like слайд
  const slideInitial = { x: 56, opacity: 0 };
  const slideAnimate = { x: 0, opacity: 1 };
  const slideExit = { x: -56, opacity: 0 };
  const slideTransition = { duration: 0.32 };

  function goCatalogRoot() {
    setMenuLevel("catalog-groups");
    setSelectedGroup(null);
  }

  function goBack() {
    if (menuLevel === "catalog-sub") {
      setMenuLevel("catalog-groups");
      setSelectedGroup(null);
    } else if (menuLevel === "catalog-groups") {
      setMenuLevel("root");
    }
  }

  function openSub(group: string) {
    setSelectedGroup(group);
    setMenuLevel("catalog-sub");
  }

  const menuNode = (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Панель меню */}
          <motion.aside
            key="menu"
            role="dialog"
            aria-modal="true"
            className="
              fixed inset-x-0 top-0 z-[1001]
              max-h-[90vh] overflow-auto
              rounded-b-3xl border border-amber-100
              bg-gradient-to-b from-white/95 via-amber-50/90 to-white/90
              backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.15)]
              lg:hidden
            "
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
          >
            <div className="p-4">
              {/* Верх */}
              <div className="mb-4 flex items-center justify-between">
                <button
                  ref={closeBtnRef}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-white/80 px-3 py-2 text-sm font-medium text-stone-800 hover:bg-white/90 transition"
                >
                  <X className="h-4 w-4" />
                  Закрити
                </button>
                <span
                  className="h-1.5 w-12 rounded-full bg-amber-200/80"
                  aria-hidden
                />
              </div>

              {/* Поиск */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as HTMLFormElement).querySelector("input");
                  const query = input?.value.trim();
                  if (!query) return;
                  window.location.href = `/catalog?search=${encodeURIComponent(
                    query
                  )}`;
                }}
                className="mb-5 flex items-center gap-2 rounded-xl border border-amber-100 bg-white/70 px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-amber-200 transition"
              >
                <Search className="h-4 w-4 text-amber-600" />
                <input
                  type="search"
                  placeholder="Пошук товарів…"
                  className="w-full bg-transparent text-[15px] text-stone-800 outline-none placeholder:text-stone-400"
                />
              </form>

              {/* Навигационная карточка */}
              <nav className="divide-y divide-amber-100/70 rounded-2xl border border-amber-100 bg-white/70 backdrop-blur-sm overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.05)]">
                <AnimatePresence mode="wait">
                  {/* ROOT-уровень */}
                  {menuLevel === "root" && (
                    <motion.div
                      key="root"
                      initial={slideInitial}
                      animate={slideAnimate}
                      exit={slideExit}
                      transition={slideTransition}
                    >
                      {items.map((it) => {
                        const isCatalog = it.href === "/catalog";

                        const active =
                          currentPath === it.href ||
                          (it.href === "/catalog" &&
                            currentPath.startsWith("/product/")) ||
                          currentPath.startsWith(`${it.href}/`);

                        if (isCatalog) {
                          return (
                            <button
                              key="catalog"
                              type="button"
                              onClick={goCatalogRoot}
                              className={`w-full flex items-center justify-between px-5 py-3 text-[15px] font-medium transition-all ${
                                active
                                  ? "bg-amber-50 text-amber-800"
                                  : "text-stone-800 hover:bg-amber-50/70"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {it.icon && (
                                  <span className="text-amber-600">{it.icon}</span>
                                )}
                                <span>{it.label}</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-amber-600 opacity-80" />
                            </button>
                          );
                        }

                        return (
                          <Link
                            key={it.href}
                            href={it.href}
                            onClick={onClose}
                            className={`flex items-center justify-between px-5 py-3 text-[15px] font-medium transition-all ${
                              active
                                ? "bg-amber-50 text-amber-800"
                                : "text-stone-800 hover:bg-amber-50/70"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {it.icon && (
                                <span className="text-amber-600">{it.icon}</span>
                              )}
                              <span>{it.label}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-amber-600 opacity-80" />
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Группы каталога */}
                  {menuLevel === "catalog-groups" && (
                    <motion.div
                      key="groups"
                      initial={slideInitial}
                      animate={slideAnimate}
                      exit={slideExit}
                      transition={slideTransition}
                    >
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex items-center gap-2 px-5 py-3 text-[15px] font-medium text-stone-700 bg-amber-50/60 hover:bg-amber-50 transition-all"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white border border-amber-200">
                          <ChevronLeft className="h-3.5 w-3.5 text-amber-700" />
                        </span>
                        <span>Назад</span>
                      </button>

                      {CATALOG_GROUPS.map((g) => (
                        <button
                          key={g.key}
                          type="button"
                          onClick={() => openSub(g.key)}
                          className="w-full flex items-center justify-between px-5 py-3 text-[15px] font-medium text-stone-800 hover:bg-amber-50/70 transition"
                        >
                          <span>{g.title}</span>
                          <ChevronRight className="h-4 w-4 text-amber-600 opacity-80" />
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Подкатегории выбранной группы */}
                  {menuLevel === "catalog-sub" && selectedGroup && (
                    <motion.div
                      key="sub"
                      initial={slideInitial}
                      animate={slideAnimate}
                      exit={slideExit}
                      transition={slideTransition}
                    >
                      <button
                        type="button"
                        onClick={goBack}
                        className="flex items-center gap-2 px-5 py-3 text-[15px] font-medium text-stone-700 bg-amber-50/60 hover:bg-amber-50 transition-all"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white border border-amber-200">
                          <ChevronLeft className="h-3.5 w-3.5 text-amber-700" />
                        </span>
                        <span>Назад</span>
                      </button>

                      {CATALOG_SUB[selectedGroup]?.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/catalog?category=${c.slug}`}
                          onClick={onClose}
                          className="flex items-center justify-between px-5 py-3 text-[15px] font-medium text-stone-800 hover:bg-amber-50/70 transition"
                        >
                          <span>{c.title}</span>
                          <ChevronRight className="h-4 w-4 text-amber-600 opacity-80" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>

              {/* Подпись */}
              <div className="pt-5 text-center text-[13px] text-stone-500">
                © {new Date().getFullYear()}{" "}
                <span className="text-stone-700 font-medium">Gnizde.4ko</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return mounted.current ? createPortal(menuNode, document.body) : null;
}
