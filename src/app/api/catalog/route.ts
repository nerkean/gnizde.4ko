import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);

  const page      = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit     = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 60);
  const q         = (searchParams.get("q") || "").trim();
  const category  = (searchParams.get("category") || "").trim();
  const minPrice  = Number(searchParams.get("minPrice") || "");
  const maxPrice  = Number(searchParams.get("maxPrice") || "");

  // 🔹 НОВОЕ: поддерживаем и новый параметр availability, и старый inStock=true
  const rawAvailability = (searchParams.get("availability") || "").trim();
  const inStockFlag = searchParams.get("inStock") === "true";

  const allowedAvail = ["in_stock", "on_order", "out_of_stock"] as const;
  const availability = allowedAvail.includes(rawAvailability as any)
    ? (rawAvailability as (typeof allowedAvail)[number])
    : null;

  const sortKey   = (searchParams.get("sort") || "popular").trim(); // popular | price_asc | price_desc | new

  const filter: any = { active: true };

  // поиск по названию
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title_ua: re }, { title_ru: re }, { title_en: re }];
  }

  // категория
  if (category) filter.category = category;

  // диапазон цены
  const priceCond: any = {};
  if (!Number.isNaN(minPrice)) priceCond.$gte = minPrice;
  if (!Number.isNaN(maxPrice) && maxPrice > 0) priceCond.$lte = maxPrice;
  if (Object.keys(priceCond).length) filter.priceUAH = priceCond;

  // 🔹 НОВОЕ: фильтрация по availability
  if (availability) {
    // если явно передали availability
    filter.availability = availability;
  } else if (inStockFlag) {
    // бэкап: если старый параметр inStock=true — считаем, что нужны только in_stock
    filter.availability = "in_stock";
  }
  // ❗ Старый фильтр по stock (>0) больше НЕ нужен,
  //   вся логика теперь в поле availability
  // if (inStock) filter.stock = { $gt: 0 };

  // сортировка
  const sort: Record<string, 1 | -1> = {};
  if (sortKey === "price_asc") sort.priceUAH = 1;
  else if (sortKey === "price_desc") sort.priceUAH = -1;
  else if (sortKey === "new") sort.createdAt = -1;
  else sort._id = -1; // условно «популярні»

  const total = await Product.countDocuments(filter);
const products = await Product.find(filter)
  .select("_id id slug title_ua images priceUAH stock category createdAt availability")
  .sort(sort)
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();


  // фасеты для сайдбара (категории + min/max цены)
  const [cats, minmax] = await Promise.all([
    Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Product.aggregate([
      { $match: { active: true } },
      { $group: { _id: null, min: { $min: "$priceUAH" }, max: { $max: "$priceUAH" } } },
      { $project: { _id: 0, min: 1, max: 1 } },
    ]),
  ]);

  return NextResponse.json({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    products,
    facets: {
      categories: cats
        .filter((c) => c._id)
        .map((c) => ({ value: c._id, count: c.count })),
      price: minmax[0] || { min: 0, max: 0 },
    },
  });
}
