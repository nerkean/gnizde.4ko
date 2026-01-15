import Link from "next/link";
import Image from "next/image";
import { PackageSearch, ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import CatalogPagination from "@/components/catalog/CatalogPagination";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import CatalogControls from "@/components/catalog/CatalogControls";
import type { Metadata } from "next";

/* ---------------- ТИПИ ТА ХЕЛПЕРИ ---------------- */

type SP = Record<string, string>;
type Props = { searchParams: SP } | { searchParams: Promise<SP> };

async function resolveSearchParams(p: Props["searchParams"]): Promise<SP> {
  const anyp: any = p as any;
  return anyp && typeof anyp.then === "function" ? await (p as Promise<SP>) : (p as SP);
}

async function fetchCatalog(sp: SP) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://gnizde4ko.onrender.com";
  const url = new URL(`${base}/api/catalog`);
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string" && v.length > 0) url.searchParams.set(k, v);
  }
  if (!url.searchParams.get("limit")) url.searchParams.set("limit", "12");
  const res = await fetch(url.toString(), { cache: "no-store" });
  return res.json();
}

type CatalogCategoryContent = {
  slug?: string;
  title?: { ua?: string };
  image?: { url?: string; alt?: { ua?: string }; kind?: "image" | "video" };
};

async function fetchCatalogCategoriesContent(): Promise<CatalogCategoryContent[] | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://gnizde4ko.onrender.com";
  const url = new URL(`${base}/api/content/catalog.categories`);
  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    const doc = json?.doc;
    const data = doc?.data;
    const cats = (data?.categories || []) as CatalogCategoryContent[];
    return cats;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: Props): Promise<Metadata> {
  const sp = await resolveSearchParams((props as any).searchParams);
  const baseTitle = "Каталог виробів — Gnizde.4ko";
  const baseDescription =
    "Каталог виробів майстерні Gnizde.4ko: соломʼяні павуки, вінки, дідухи. Оберіть категорію або скористайтеся фільтрами.";

  let title = baseTitle;
  if (sp.category) {
    const cat = ALL_CATEGORY_META.find((c) => c.slug === sp.category);
    if (cat?.title) title = `${cat.title} — каталог | Gnizde.4ko`;
  } else if (sp.group) {
    const groupMap: Record<string, string> = {
      pavuky: "Павуки з соломи",
      vinky: "Соломʼяні вінки",
      other: "Декор з соломи",
    };
    const groupTitle = groupMap[sp.group];
    if (groupTitle) title = `${groupTitle} — каталог | Gnizde.4ko`;
  }

  return {
    title,
    description: baseDescription,
    openGraph: { title, description: baseDescription, type: "website", siteName: "Gnizde.4ko" },
    twitter: { card: "summary_large_image", title, description: baseDescription },
  };
}

/* ---------------- КОНСТАНТИ КАТЕГОРІЙ ---------------- */

const BASE_TOP_GROUPS = [
  { slug: "pavuky", title: "Павуки", image: "/images/categories/pavuky-main.jpg", desc: "Традиційні обереги для дому" },
  { slug: "vinky", title: "Вінки", image: "/images/categories/zlaky.jpg", desc: "Прикраси зі злаків та трав" },
  { slug: "other", title: "Інше", image: "/images/categories/kolosky.jpg", desc: "Дідухи, коники та декор" },
];

const BASE_PAVUKY_SUBCATEGORIES = [
  { slug: "pavuky-rizdvo", title: "Павуки до Різдва", image: "/images/categories/pavuky-rizdvo.jpg" },
  { slug: "vyshyti-pavuky", title: "Вишиті павуки", image: "/images/categories/vyshyti-pavuky.jpg" },
  { slug: "pavuky-velykden", title: "Павуки великодні", image: "/images/categories/pavuky-velykden.jpg" },
  { slug: "nabory-pavukiv", title: "Набори павуків", image: "/images/categories/nabory-pavukiv.jpg" },
  { slug: "nabory-vyshytykh-pavukiv", title: "Набори вишитих", image: "/images/categories/nabory-vyshytykh.jpg" },
];

const BASE_VINKY_SUBCATEGORIES = [
  { slug: "vinky-zlak", title: "Вінки зі злаків", image: "/images/categories/zlaky.jpg" },
  { slug: "vinky-rizdviani", title: "Вінки Різдвяні", image: "/images/categories/rizdviani.jpg" },
  { slug: "vinky-shkarlupa", title: "Вінки зі шкаралупи", image: "/images/categories/shkarlupa.jpg" },
];

const BASE_OTHER_SUBCATEGORIES = [
  { slug: "snopy-didukhy", title: "Снопи та дідухи", image: "/images/categories/snopy.jpg" },
  { slug: "vyroby-sino", title: "Вироби з сіна", image: "/images/categories/sino.jpg" },
  { slug: "kolosky-soloma-sino", title: "Матеріали", image: "/images/categories/kolosky.jpg" },
];

const ALL_CATEGORY_META = [
  ...BASE_PAVUKY_SUBCATEGORIES,
  ...BASE_VINKY_SUBCATEGORIES,
  ...BASE_OTHER_SUBCATEGORIES,
];

/* ---------------- КОМПОНЕНТИ UI ---------------- */

// 1. Красива картка категорії
function CategoryCard({
  slug,
  title,
  image,
  desc,
  href,
  priority = false,
}: {
  slug: string;
  title: string;
  image: string;
  desc?: string;
  href: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative block w-full overflow-hidden rounded-[2.5rem] bg-stone-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 aspect-[3/4] sm:aspect-[4/5]"
    >
      <Image
        src={image}
        alt={title}
        fill
        priority={priority} 
        className="object-cover transition-transform duration-1000 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      
      {/* Градієнт оверлей */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-80" />
      
      {/* Контент */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <div className="transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
          <Sparkles className="mb-3 h-5 w-5 text-amber-200/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white leading-none drop-shadow-md">
            {title}
          </h3>
          {desc && (
            <p className="mt-2 text-sm text-stone-200 opacity-80 line-clamp-2">
              {desc}
            </p>
          )}
          
          <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-100 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            Переглянути <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// 2. Хлібні крихти для навігації
function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-stone-500">
      <Link href="/catalog" className="hover:text-stone-900 transition-colors">
        Каталог
      </Link>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3 text-stone-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-stone-900 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-stone-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export default async function CatalogPage(props: Props) {
  const sp = await resolveSearchParams((props as any).searchParams);

  // Отримуємо картинки з CMS (динамічні)
  const catalogCategoriesContent = await fetchCatalogCategoriesContent();
  const imageMap = new Map<string, string>();
  if (catalogCategoriesContent) {
    for (const c of catalogCategoriesContent) {
      if (c?.slug && c.image?.url) {
        imageMap.set(c.slug, c.image.url);
      }
    }
  }

  const applyImages = <T extends { slug: string; image: string }>(items: T[]): T[] =>
    items.map((item) => ({
      ...item,
      image: imageMap.get(item.slug) || item.image,
    }));

  const TOP_GROUPS = applyImages(BASE_TOP_GROUPS);
  const PAVUKY_SUBCATEGORIES = applyImages(BASE_PAVUKY_SUBCATEGORIES);
  const VINKY_SUBCATEGORIES = applyImages(BASE_VINKY_SUBCATEGORIES);
  const OTHER_SUBCATEGORIES = applyImages(BASE_OTHER_SUBCATEGORIES);
  
  // 1. ГОЛОВНА СТОРІНКА КАТАЛОГУ (ВИБІР ГРУПИ)
  if (!sp.category && !sp.group) {
    return (
      <section className="min-h-screen py-16 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-700/60 mb-3 block">
              Майстерня
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-stone-900 mb-6 leading-tight">
              Каталог виробів
            </h1>
            <p className="text-stone-600 text-lg font-light leading-relaxed">
              Кожен виріб створено власноруч з любов'ю до традицій та природи. 
              Оберіть категорію, щоб знайти свій особливий оберіг.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TOP_GROUPS.map((grp) => (
              <CategoryCard
                key={grp.slug}
                {...grp}
                href={`/catalog?group=${grp.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 2. СТОРІНКА ПІДКАТЕГОРІЙ (ГРУПА)
  let subcategories: typeof BASE_PAVUKY_SUBCATEGORIES = [];
  let groupTitle = "";
  
  if (sp.group === "pavuky") {
    subcategories = PAVUKY_SUBCATEGORIES;
    groupTitle = "Павуки";
  } else if (sp.group === "vinky") {
    subcategories = VINKY_SUBCATEGORIES;
    groupTitle = "Вінки";
  } else if (sp.group === "other") {
    subcategories = OTHER_SUBCATEGORIES;
    groupTitle = "Інше";
  }

  if (sp.group && !sp.category && subcategories.length > 0) {
    return (
      <section className="min-h-screen py-10 px-4 sm:px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: groupTitle }]} />
          
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-semibold text-stone-900 mb-4">
              {groupTitle}
            </h1>
            <p className="text-stone-600 max-w-xl">
              Оберіть підкатегорію, щоб переглянути доступні вироби.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {subcategories.map((cat) => (
              <CategoryCard
                key={cat.slug}
                {...cat}
                href={`/catalog?category=${cat.slug}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 3. СТОРІНКА СПИСКУ ТОВАРІВ
  const data = await fetchCatalog(sp);
  const { products, total, totalPages, facets } = data;
  const hasProducts = products.length > 0;
  
  // Визначаємо назву для хлібних крихт
  const categoryTitle = ALL_CATEGORY_META.find((c) => c.slug === sp.category)?.title || "Всі товари";
  let parentGroup = { label: "Каталог", href: "/catalog" };
  
  if (sp.group) {
    // Якщо є група в URL, хоча тут ми вже в категорії, можна спробувати знайти parent
    // Для спрощення просто показуємо категорію
  }

  return (
    <section className="relative w-full min-h-screen bg-white">
      {/* Декоративний фон зверху */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-amber-50/50 to-transparent -z-10" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[{ label: categoryTitle }]} />

        {/* Заголовок категорії */}
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-stone-900 leading-tight">
              {categoryTitle}
            </h1>
          </div>

          {total > 0 && (
            <div className="shrink-0">
               <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-600 shadow-sm">
                 <PackageSearch className="h-4 w-4 text-amber-600" />
                 {total} {total === 1 ? "виріб" : total > 4 ? "виробів" : "вироби"}
               </span>
            </div>
          )}
        </header>

        {/* Layout: Фільтри + Сітка */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            <CatalogFilters facets={facets} variant="desktop" />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9 min-w-0">
            {/* Мобільні фільтри та сортування */}
            <div className="sticky top-20 z-10 mb-6 lg:static lg:mb-8">
               <div className="rounded-2xl border border-stone-200 bg-white/80 backdrop-blur-xl px-4 py-3 shadow-sm lg:border-none lg:bg-transparent lg:shadow-none lg:p-0">
                  <CatalogControls facets={facets} />
               </div>
            </div>

            {/* Сітка товарів */}
            {!hasProducts ? (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border border-stone-100 bg-stone-50/50 py-20 text-center">
                <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                   <PackageSearch className="h-8 w-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900">Нічого не знайдено</h3>
                <p className="mt-2 text-stone-500 max-w-xs mx-auto">
                  Спробуйте змінити фільтри або пошуковий запит
                </p>
                <Link href="/catalog" className="mt-6 text-sm font-medium text-amber-700 hover:underline">
                  Переглянути всі категорії
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                  {products.map((p: any) => (
                    <ProductCard
                      key={p._id || p.id}
                      product={{
                        id: String(p._id || p.id),
                        slug: p.slug,
                        title_ua: p.title_ua,
                        priceUAH: Number(p.priceUAH || 0),
                        images: p.images || [],
                        stock: typeof p.stock === "number" ? p.stock : undefined,
                        availability: p.availability,
                      }}
                    />
                  ))}
                </div>

                <div className="mt-16 flex justify-center border-t border-stone-100 pt-8">
                  <CatalogPagination totalPages={totalPages} />
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}