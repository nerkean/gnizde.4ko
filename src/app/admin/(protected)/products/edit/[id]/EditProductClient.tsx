"use client";

import ProductForm from "@/components/ProductForm";

// Если у вас есть общий тип Product, лучше импортировать его,
// но пока можно оставить any или описать интерфейс
export default function EditProductClient({ product }: { product: any }) {
  return (
    // Мы просто рендерим форму, передаем товар и флаг редактирования
    // Вся логика загрузки фото и сохранения теперь внутри ProductForm
    <ProductForm product={product} isEdit={true} />
  );
}