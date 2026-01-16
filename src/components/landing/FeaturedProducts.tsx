"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

type PlainProduct = {
  id: string;
  slug: string;
  title_ua?: string;
  priceUAH?: number;
  imageUrl?: string;
  stock?: number;
  availability?: "in_stock" | "on_order" | "out_of_stock";
};

export default function FeaturedProducts({
  title,
  subtitle,
  products,
  moreLink,
}: {
  title: string;
  subtitle?: string;
  products: PlainProduct[];
  moreLink?: string;
}) {
  return (
    <div className="relative w-full">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.03),transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto mb-12 max-w-2xl text-center sm:mb-16 z-10">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
          Каталог
        </span>
        <h2 className="mb-4 font-display text-3xl font-bold leading-tight text-stone-900 sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-stone-600 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: {
                opacity: 1,
                y: 0,
                transition: { delay: i * 0.05, duration: 0.6, type: "spring", stiffness: 50 },
              },
            }}
            className="h-full"
          >
            <ProductCard 
              product={p as any} 
              priority={i < 4} 
            />
          </motion.div>
        ))}
      </motion.div>

      {moreLink && (
        <div className="relative z-10 mt-16 flex justify-center">
          <Link
            href={moreLink}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-stone-200 bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-stone-900 transition-all hover:border-stone-900 hover:bg-stone-900 hover:text-white hover:shadow-lg"
          >
            <span>Переглянути більше</span>
          </Link>
        </div>
      )}
    </div>
  );
}