"use client";

import AddToCart from "@/components/AddToCart";
import ProductGallery from "@/components/ProductGallery";

export type ProductDTO = {
  _id: string;
  slug: string;
  title_ua: string;
  priceUAH: number;
  images?: string[];
  desc_ua?: string;
  category?: string;
};

export default function ProductPageClient({
  product,
  related,
}: {
  product: ProductDTO;
  related: ProductDTO[];
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
<ProductGallery
  title={product.title_ua}
  images={(product.images || []).map((src) => ({ src, alt_ua: product.title_ua }))}
/>


      <div>
        <h1 className="text-3xl font-semibold">{product.title_ua}</h1>
        <div className="mt-2 text-xl">{product.priceUAH} ₴</div>
        <p className="mt-6 text-stone-700">{product.desc_ua}</p>
        {/* ВАЖНО: сюда уходит ИМЕННО product._id */}
        <AddToCart productId={product._id} className="mt-6" />
      </div>
    </div>
  );
}