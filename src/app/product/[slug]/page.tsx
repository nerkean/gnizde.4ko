import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllProducts,
  getProductBySlug,
} from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import AddToCart from "@/components/AddToCart";
import MobileBuyBar from "@/components/product/MobileBuyBar";
import { Truck, Package, ChevronRight, ShieldCheck, Info } from "lucide-react";

type Params = { slug: string };
type Props = { params: Promise<Params> };

const formatUAH = (v: number | string | undefined) =>
  `${String(Math.round(Number(v ?? 0))).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ₴`;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return { title: "Товар не знайдено — Gnizde.4ko" };
  }

  const title = `${product.title_ua} — Gnizde.4ko`;
  const image = (Array.isArray(product.images) && product.images[0]) || "/images/placeholder.svg";
  
  return {
    title,
    description: product.desc_ua?.slice(0, 160) || "Соломʼяний декор ручної роботи.",
    openGraph: {
      title,
      description: product.desc_ua?.slice(0, 160),
      images: [{ url: image, alt: product.title_ua }],
    },
  };
}

export default async function ProductPage(props: Props) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  
  if (!product) return notFound();

  const images = product.images?.length ? product.images : ["/images/placeholder.svg"];
  const priceText = product.priceUAHFormatted ?? formatUAH(product.priceUAH);

  const all = await getAllProducts();
  const related = all.filter((p: any) => p.slug !== slug).slice(0, 4);

  const availability = product.availability || "in_stock";
  const isAvailable = availability !== "out_of_stock";
  
  const statusConfig = {
    in_stock: { label: "В наявності", style: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    on_order: { label: "Під замовлення", style: "bg-amber-100 text-amber-800 border-amber-200" },
    out_of_stock: { label: "Немає в наявності", style: "bg-stone-100 text-stone-500 border-stone-200" },
  };
  const status = statusConfig[availability] || statusConfig.in_stock;

  return (
    <section className="bg-[#FAFAF9] min-h-screen pb-20 overflow-x-hidden">
      
      <div className="container px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-stone-500 overflow-hidden whitespace-nowrap">
          <Link href="/" className="hover:text-stone-900 transition hover:underline">Головна</Link>
          <ChevronRight size={12} className="text-stone-300" />
          <Link href="/catalog" className="hover:text-stone-900 transition hover:underline">Каталог</Link>
          <ChevronRight size={12} className="text-stone-300" />
          <span className="font-medium text-stone-900 truncate">{product.title_ua}</span>
        </nav>
      </div>

      <div className="container px-4 sm:px-6 lg:px-8 pt-2 lg:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
          <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-24 z-10 relative">
            <div className="rounded-[2rem] bg-white shadow-sm border border-stone-200/60 p-0 overflow-hidden">
               <ProductGallery 
                 images={images} 
                 title={product.title_ua} 
               />
            </div>
          </div>

          <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-6">
            
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${status.style}`}>
                   {status.label}
                 </span>
                 {product.showDetailsBlocks && (
                   <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                     Ручна робота
                   </span>
                 )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-900 leading-[1.1] mb-4">
                {product.title_ua}
              </h1>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">{priceText}</span>
              </div>
            </div>

            <div className="hidden lg:block bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
               {isAvailable ? (
                 <AddToCart productId={product.id} className="w-full h-14 text-lg shadow-xl shadow-stone-900/10" />
               ) : (
                 <button disabled className="w-full h-14 rounded-2xl bg-stone-100 text-stone-400 font-medium cursor-not-allowed border border-stone-200">
                   Товар тимчасово закінчився
                 </button>
               )}
               
               <div className="mt-4 flex items-center justify-center gap-6 text-xs text-stone-500 font-medium border-t border-stone-100 pt-4">
                  <div className="flex items-center gap-1.5"><Truck size={16} className="text-emerald-600"/> 1-3 дні доставка</div>
                  <div className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600"/> Гарантія якості</div>
               </div>
            </div>

            {product.desc_ua && (
              <div className="prose prose-stone prose-base text-stone-600 leading-relaxed max-w-none">
                <p className="whitespace-pre-line">{product.desc_ua}</p>
              </div>
            )}

            {!product.showDetailsBlocks && (
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                   <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3 text-emerald-600">
                      <Truck size={20} />
                   </div>
                   <h4 className="font-bold text-stone-900 mb-1">Доставка</h4>
                   <p className="text-sm text-stone-500 leading-relaxed">
                      Швидка відправка Новою Поштою або Укрпоштою по всій Україні.
                   </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                   <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center mb-3 text-amber-600">
                      <Package size={20} />
                   </div>
                   <h4 className="font-bold text-stone-900 mb-1">Пакування</h4>
                   <p className="text-sm text-stone-500 leading-relaxed">
                      Надійні крафтові коробки, щоб виріб доїхав цілим.
                   </p>
                </div>
              </div>
            )}

            {product.showDetailsBlocks && (
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                
                {product.details_ua && (
                  <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center mb-3 text-amber-600">
                       <Info size={20} />
                    </div>
                    <h4 className="font-bold text-stone-900 mb-1">Деталі виробу</h4>
                    <div className="text-sm text-stone-500 leading-relaxed whitespace-pre-wrap">
                      {product.details_ua}
                    </div>
                  </div>
                )}

                {product.delivery_ua && (
                   <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                     <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center mb-3 text-emerald-600">
                        <Truck size={20} />
                     </div>
                     <h4 className="font-bold text-stone-900 mb-1">Доставка та пакування</h4>
                     <div className="text-sm text-stone-500 leading-relaxed whitespace-pre-wrap">
                       {product.delivery_ua}
                     </div>
                   </div>
                )}
              </div>
            )}

          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20 lg:mt-32 border-t border-stone-200 pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-stone-900 font-display">Вам також може сподобатися</h2>
              <Link href="/catalog" className="hidden sm:block text-sm font-medium text-amber-700 hover:text-amber-800 hover:underline">
                 Дивитись все
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 sm:gap-6">
              {related.map((r: any) => (
                <ProductCard key={r.id || r._id} product={r} />
              ))}
            </div>
          </div>
        )}
      </div>

      {isAvailable && (
         <MobileBuyBar productId={product.id} priceText={priceText} />
      )}
    </section>
  );
}