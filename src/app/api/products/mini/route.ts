import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || !ids.length) {
      return NextResponse.json({ items: [] });
    }

    await connectDB();
    
    // 👇 Добавил 'slug' в выборку
    const docs = await Product.find({ _id: { $in: ids } }) // Убрал active: true, чтобы показывать даже скрытые товары в корзине (опционально)
      .select("title_ua priceUAH images slug")
      .lean();

    const map = new Map<string, any>();
    for (const d of docs) {
      map.set(String(d._id), {
        id: String(d._id),
        title: String(d.title_ua ?? "Товар"),
        priceUAH: Number(d.priceUAH ?? 0),
        image:
          Array.isArray(d.images) && d.images.length
            ? String(d.images[0])
            : undefined,
        slug: d.slug, // 👇 Возвращаем slug
      });
    }

    const result = ids
      .map((id: string) => map.get(String(id)))
      .filter(Boolean);

    return NextResponse.json({ items: result });
  } catch (e: any) {
    console.error("[mini products] error:", e);
    return NextResponse.json({ items: [] });
  }
}