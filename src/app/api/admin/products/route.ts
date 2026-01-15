import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { toSlug } from "@/lib/slug";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get("query") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(50, Math.max(5, Number(searchParams.get("limit") || 20)));
  const activeParam = searchParams.get("active");

  const filter: any = {};
  if (q) {
    filter.$or = [
      { title_ua: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }
  if (activeParam === "1") filter.active = true;
  if (activeParam === "0") filter.active = false;

  const total = await Product.countDocuments(filter);
  const items = await Product.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({ ok: true, page, limit, total, items });
}

// POST /api/admin/products
export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json().catch(() => ({}));

  const title_ua = String(body.title_ua || "").trim();
  const priceUAH = Number(body.priceUAH);
  const category = (body.category ? String(body.category) : "").trim();
  const desc_ua  = (body.desc_ua ? String(body.desc_ua) : "").trim();
  const stock    = body.stock != null ? Number(body.stock) : 0;
  const active   = body.active != null ? Boolean(body.active) : true;
  const images   = Array.isArray(body.images) ? body.images.map(String) : [];

  const showDetailsBlocks =
    body.showDetailsBlocks != null ? Boolean(body.showDetailsBlocks) : false;

  // 👇 ДОБАВИЛ ПОЛУЧЕНИЕ ТЕКСТА
  const details_ua = (body.details_ua ? String(body.details_ua) : "").trim();
  const delivery_ua = (body.delivery_ua ? String(body.delivery_ua) : "").trim();

  const allowedAvail = ["in_stock", "on_order", "out_of_stock"] as const;
  const availability = allowedAvail.includes(body.availability)
    ? body.availability
    : "in_stock";

  if (!title_ua) {
    return NextResponse.json({ ok: false, error: "title_ua required" }, { status: 400 });
  }
  if (!Number.isFinite(priceUAH) || priceUAH < 0) {
    return NextResponse.json(
      { ok: false, error: "priceUAH must be >= 0" },
      { status: 400 }
    );
  }

  // slug
  let slug = String(body.slug || "").trim();
  if (!slug) slug = toSlug(title_ua);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "slug required" }, { status: 400 });
  }

  let base = slug,
    n = 1;
  while (await Product.exists({ slug })) {
    slug = `${base}-${++n}`;
  }

  const created = await Product.create({
    title_ua,
    slug,
    priceUAH,
    category,
    desc_ua,
    stock,
    active,
    images,
    showDetailsBlocks,
    availability,
    
    // 👇 ДОБАВИЛ СОХРАНЕНИЕ В БАЗУ
    details_ua,
    delivery_ua,
  });

  return NextResponse.json({ ok: true, item: created });
}