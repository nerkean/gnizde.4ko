"use client";

import ProductForm from "@/components/ProductForm";

export default function EditProductClient({ product }: { product: any }) {
  return (
    <ProductForm product={product} isEdit={true} />
  );
}