"use client";

import Image from "next/image";
import Link from "next/link";
import AddToCart from "@/components/AddToCart";
import { Play, ShoppingBag } from "lucide-react";

type ImgObj = {
  url?: string;
  medium?: { url?: string };
  thumb?: { url?: string };
};

type Product = {
  id: string;
  slug: string;
  title_ua?: string;
  priceUAH?: number;
  imageUrl?: string;
  image?: string | ImgObj;
  images?: (string | ImgObj)[];
  stock?: number;
  availability?: "in_stock" | "on_order" | "out_of_stock";
};

function isVideoUrl(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
}

function collectMediaUrls(p: Product): string[] {
  const urls: string[] = [];
  if (p.imageUrl) urls.push(p.imageUrl);
  if (p.image) {
    if (typeof p.image === "string") {
      urls.push(p.image);
    } else {
      if (p.image.url) urls.push(p.image.url);
      if (p.image.medium?.url) urls.push(p.image.medium.url);
      if (p.image.thumb?.url) urls.push(p.image.thumb.url);
    }
  }
  if (Array.isArray(p.images)) {
    for (const item of p.images) {
      if (typeof item === "string") {
        urls.push(item);
      } else {
        if (item.url) urls.push(item.url);
        if (item.medium?.url) urls.push(item.medium.url);
        if (item.thumb?.url) urls.push(item.thumb.url);
      }
    }
  }
  return Array.from(new Set(urls.filter(Boolean)));
}

function pickMainMedia(p: Product): { src: string; kind: "image" | "video" } {
  const urls = collectMediaUrls(p);
  const img = urls.find((u) => !isVideoUrl(u));
  if (img) return { src: img, kind: "image" };
  const vid = urls.find((u) => isVideoUrl(u));
  if (vid) return { src: vid, kind: "video" };
  return { src: "/images/placeholder.svg", kind: "image" };
}

export default function ProductCard({ 
  product, 
  priority = false 
}: { 
  product: Product; 
  priority?: boolean;
}) {
  const href = `/product/${product.slug}`;
  const media = pickMainMedia(product);
  const title = product.title_ua || "Без назви";
  const price = Number(product.priceUAH ?? 0);

  const availability =
    product.availability ??
    (typeof product.stock === "number"
      ? product.stock > 0 ? "in_stock" : "out_of_stock"
      : "in_stock");

  const isAvailable = availability !== "out_of_stock";

  let statusBadge = null;
  if (availability === "on_order") {
    statusBadge = (
      <span className="rounded-lg bg-amber-100/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 shadow-sm border border-amber-200/50">
        Під замовлення
      </span>
    );
  } else if (availability === "out_of_stock") {
    statusBadge = (
      <span className="rounded-lg bg-stone-100/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500 shadow-sm border border-stone-200/50">
        Немає в наявності
      </span>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] hover:border-stone-200">

      <Link href={href} className="relative aspect-[4/5] w-full overflow-hidden bg-stone-50">
        {media.kind === "video" ? (
          <>
            <video
              src={media.src}
              className="h-full w-full object-cover"
              muted
              loop
              playsInline
            />
            <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 backdrop-blur-md shadow-sm">
              <Play size={12} className="fill-white text-white ml-0.5" />
            </div>
          </>
        ) : (
          <Image
            src={media.src}
            alt={title}
            fill
            priority={priority}
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        {statusBadge && (
          <div className="absolute top-3 left-3 z-10">
            {statusBadge}
          </div>
        )}

      </Link>

      <div className="flex flex-1 flex-col p-5">

        <Link href={href} className="mb-2 block">
          <h3 className="text-[15px] sm:text-[16px] font-bold text-stone-900 leading-snug line-clamp-2 transition-colors group-hover:text-amber-700">
            {title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="flex flex-col">
             <span className="text-[10px] uppercase text-stone-400 font-bold tracking-wider">Ціна</span>
             <div className="text-lg font-bold text-stone-900 leading-none">
               {price.toLocaleString("uk-UA")} <span className="text-sm font-normal text-stone-500">₴</span>
             </div>
          </div>
        </div>

        <div className="mt-4">
           {isAvailable ? (
             <AddToCart
               productId={product.id}
               className="w-full justify-center rounded-xl bg-stone-900 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-stone-700 hover:shadow-lg active:scale-95"
             />
           ) : (
             <button
               disabled
               className="w-full rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-400 cursor-not-allowed border border-stone-200"
             >
               Недоступно
             </button>
           )}
        </div>
      </div>

    </article>
  );
}