import { Search as SearchIcon, PackageSearch } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

type SP = Record<string, string | string[] | undefined>;
type Props =
  | { searchParams: SP }
  | { searchParams: Promise<SP> };

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveSearchParams(p: Props["searchParams"]): Promise<SP> {
  const anyp: any = p;
  if (anyp && typeof anyp.then === "function") {
    return await anyp;
  }
  return p as SP;
}

export default async function SearchPage(props: Props) {
  const sp = await resolveSearchParams((props as any).searchParams);

  const rawQ = sp.q;
  const q =
    typeof rawQ === "string"
      ? rawQ.trim()
      : Array.isArray(rawQ)
      ? (rawQ[0] || "").trim()
      : "";

  let products: any[] = [];

  if (q) {
    await connectDB();

    const safe = escapeRegExp(q);
    const re = new RegExp(safe, "i");

    products = await Product.find({
      active: true,
      $or: [{ title_ua: re }, { title_ru: re }, { title_en: re }],
    })
      .select("_id id slug title_ua images priceUAH availability stock")
      .limit(48)
      .lean();
  }

  const hasQuery = q.length > 0;
  const hasResults = products.length > 0;

  console.log("SEARCH PAGE q =", q, "products len =", products.length);

  return (
    <section className="relative w-full bg-gradient-to-b from-amber-50/40 via-white to-amber-100/30">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-100/60 via-transparent to-transparent blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 sm:mb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-white/80 px-3 py-1 shadow-sm">
              <SearchIcon className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-700/80">
                Пошук
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-[32px] font-display font-semibold tracking-[-0.03em] text-stone-900">
                {hasQuery ? (
                  <>
                    Результати за запитом{" "}
                    <span className="bg-amber-100/70 px-2 py-0.5 rounded-xl text-amber-800 text-[90%]">
                      “{q}”
                    </span>
                  </>
                ) : (
                  "Пошук виробів"
                )}
              </h1>

              <p className="mt-2 text-sm sm:text-[15px] text-stone-600 max-w-xl">
                {hasQuery
                  ? "Ми знайшли вироби, які відповідають вашому запиту."
                  : "Введіть назву виробу або частину слова у полі пошуку вгорі."}
              </p>
            </div>
          </div>

          {hasQuery && (
            <div className="inline-flex flex-col items-start sm:items-end gap-1 rounded-2xl border border-amber-100/90 bg-white/90 px-4 py-3 text-xs sm:text-sm text-stone-700 shadow-sm">
              <span className="inline-flex items-center gap-2 font-medium text-stone-900">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-[12px] font-semibold text-amber-700">
                  {products.length}
                </span>
                {products.length === 1
                  ? "знайдений виріб"
                  : products.length >= 2 && products.length <= 4
                  ? "знайдені вироби"
                  : "знайдених виробів"}
              </span>
              <span className="text-[11px] text-stone-500">
                Показані перші {Math.min(products.length, 48)} результатів
              </span>
            </div>
          )}
        </header>

        {!hasQuery && (
          <div className="mt-4 rounded-3xl border border-dashed border-amber-200 bg-white/70 px-5 py-6 sm:px-7 sm:py-7 shadow-sm flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <SearchIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm sm:text-[15px] font-medium text-stone-900">
                Скористайтеся рядком пошуку вгорі сторінки
              </p>
              <p className="text-xs sm:text-[13px] text-stone-600">
                Наприклад: <span className="font-medium">“павук різдвяний”</span>,{" "}
                <span className="font-medium">“вінок зі злаків”</span> або{" "}
                <span className="font-medium">“набір для плетіння”</span>.
              </p>
            </div>
          </div>
        )}

        {hasQuery && !hasResults && (
          <div className="mt-6 rounded-3xl bg-white/85 border border-black/5 px-6 py-9 sm:px-8 sm:py-10 text-center shadow-sm">
            <PackageSearch className="mx-auto h-12 w-12 text-amber-600 mb-3 opacity-80" />
            <p className="text-[15px] sm:text-base font-medium text-stone-900 mb-2">
              Нічого не знайдено
            </p>
            <p className="text-sm text-stone-600 max-w-md mx-auto">
              Спробуйте змінити формулювання запиту, перевірте написання або
              скористайтеся{" "}
              <a
                href="/catalog"
                className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
              >
                каталогом товарів
              </a>
              .
            </p>
          </div>
        )}

        {hasResults && (
          <div className="mt-6 sm:mt-7">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {products.map((p) => (
                <div key={p._id || p.id} className="min-w-0">
                  <ProductCard
                    product={{
                      id: String(p._id || p.id),
                      slug: p.slug,
                      title_ua: p.title_ua,
                      priceUAH: Number(p.priceUAH || 0),
                      images: p.images || [],
                      availability: p.availability,
                      stock: p.stock,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <a
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition"
              >
                Перейти до каталогу
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
