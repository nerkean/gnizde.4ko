import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export type CardProduct = {
  id: string;
  slug: string;
  title_ua: string;
  priceUAH: number;
  priceUAHFormatted: string;
  images: string[];
  stock?: number;
  availability?: "in_stock" | "on_order" | "out_of_stock";
};

export type FullProduct = {
  id: string;
  slug: string;
  title_ua: string;
  desc_ua?: string;
  priceUAH: number;
  priceUAHFormatted: string;
  images: string[];
  category?: string;
  stock?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  showDetailsBlocks?: boolean;
  availability?: "in_stock" | "on_order" | "out_of_stock";
  
  // 👇 1. ДОБАВИЛ НОВЫЕ ПОЛЯ В ТИП
  details_ua?: string;
  delivery_ua?: string;
};

function formatUAH(value: number): string {
  const num = new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);
  return `${num} ₴`;
}

function serializeCardProduct(doc: any): CardProduct {
  const price = Number(doc.priceUAH) || 0;
  return {
    id: String(doc._id ?? doc.id ?? ""),
    slug: String(doc.slug ?? ""),
    title_ua: String(doc.title_ua ?? ""),
    priceUAH: price,
    priceUAHFormatted: formatUAH(price),
    images: Array.isArray(doc.images) ? doc.images : [],
    stock: typeof doc.stock === "number" ? doc.stock : undefined,
    availability: doc.availability as any,
  };
}

function serializeFullProduct(doc: any): FullProduct {
  const price = Number(doc.priceUAH) || 0;
  return {
    id: String(doc._id ?? doc.id ?? ""),
    slug: String(doc.slug ?? ""),
    title_ua: String(doc.title_ua ?? ""),
    desc_ua: typeof doc.desc_ua === "string" ? doc.desc_ua : "",
    priceUAH: price,
    priceUAHFormatted: formatUAH(price),
    images: Array.isArray(doc.images) ? doc.images : [],
    category: doc.category ?? "",
    stock: typeof doc.stock === "number" ? doc.stock : 0,
    active: Boolean(doc.active),
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    showDetailsBlocks: Boolean(doc.showDetailsBlocks),
    availability: doc.availability || "in_stock",

    // 👇 2. ДОБАВИЛ ПЕРЕНОС ДАННЫХ ИЗ БАЗЫ В ОБЪЕКТ
    details_ua: doc.details_ua || "", 
    delivery_ua: doc.delivery_ua || "",
  };
}

export async function getAllProducts(): Promise<CardProduct[]> {
  await connectDB();
  const docs = await Product.find({ active: true })
    .select("slug title_ua priceUAH images stock availability") 
    .sort({ createdAt: -1 })
    .lean();

  return docs.map(serializeCardProduct);
}

export async function getProductBySlug(slug: string): Promise<FullProduct | null> {
  await connectDB();
  const doc = await Product.findOne({ slug, active: true })
    .select(
      [
        "_id",
        "slug",
        "title_ua",
        "priceUAH",
        "images",
        "category",
        "stock",
        "active",
        "createdAt",
        "updatedAt",
        "desc_ua",
        "showDetailsBlocks",
        "availability",
        // 👇 3. ДОБАВИЛ В ЗАПРОС К БАЗЕ
        "details_ua",
        "delivery_ua",
      ].join(" ")
    )
    .lean();

  return doc ? serializeFullProduct(doc) : null;
}