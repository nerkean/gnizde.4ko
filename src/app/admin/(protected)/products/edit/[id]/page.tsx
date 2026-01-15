import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { notFound } from "next/navigation";
import EditProductClient from "./EditProductClient";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const productDoc = await Product.findById(id).lean();

  if (!productDoc) {
    return notFound();
  }

  // Сериализация (превращаем _id и даты в строки)
  const product = JSON.parse(JSON.stringify(productDoc));

  // 🚑 МИГРАЦИЯ НА ЛЕТУ:
  // Если у товара есть старое поле imageUrl, но нет images, переносим его
  if (!product.images || product.images.length === 0) {
    if (product.imageUrl) {
      product.images = [product.imageUrl];
    } else {
      product.images = [];
    }
  }

  return (
    <div className="pb-10">
      <EditProductClient product={product} />
    </div>
  );
}