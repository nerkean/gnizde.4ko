"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import type { CardProduct } from "@/lib/products";

export default function ProductGridDynamic({ products }: { products: CardProduct[] }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
    >
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          variants={{
            hidden: { opacity: 0, y: 16 },
            show: { opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.45, ease: "easeOut" } },
          }}
          className="card card-hover"
        >
          <ProductCard product={p} />
        </motion.div>
      ))}
    </motion.div>
  );
}
