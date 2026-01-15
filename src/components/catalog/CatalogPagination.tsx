"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function CatalogPagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const page = Math.max(parseInt(sp.get("page") || "1", 10), 1);

  if (totalPages <= 1) return null;

  const go = (p: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pages: number[] = [];
  const add = (n: number) => { if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n); };
  add(1); add(2); add(page - 1); add(page); add(page + 1); add(totalPages - 1); add(totalPages);
  const sorted = pages.sort((a, b) => a - b);

  return (
    <nav className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => go(Math.max(1, page - 1))}
        className="rounded-xl border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-50"
        disabled={page === 1}
      >
        Назад
      </button>

      {sorted.map((p, i) => {
        const prev = sorted[i - 1];
        const withEllipsis = prev && p - prev > 1;
        return (
          <span key={p} className="flex items-center">
            {withEllipsis && <span className="px-1 text-stone-400">…</span>}
            <button
              onClick={() => go(p)}
              className={`mx-0.5 rounded-xl px-3 py-1.5 text-sm ${
                p === page ? "bg-emerald-600 text-white" : "border border-stone-300"
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => go(Math.min(totalPages, page + 1))}
        className="rounded-xl border border-stone-300 px-3 py-1.5 text-sm disabled:opacity-50"
        disabled={page === totalPages}
      >
        Далі
      </button>
    </nav>
  );
}
    