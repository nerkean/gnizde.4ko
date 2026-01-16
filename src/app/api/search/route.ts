import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

const MAX_LIMIT = 8;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
const rawLimit = parseInt(searchParams.get("limit") || "8", 10);
const limit = Math.min(isNaN(rawLimit) ? 8 : rawLimit, MAX_LIMIT);

  if (!q) return NextResponse.json({ products: [] });

  await connectDB();

  const begins = await Product.find({
    $or: [
      { title_ua: new RegExp("^" + escapeRegExp(q), "i") },
      { title_ru: new RegExp("^" + escapeRegExp(q), "i") },
      { title_en: new RegExp("^" + escapeRegExp(q), "i") },
    ],
    active: true,
  })
    .select("_id slug title_ua images priceUAH")
    .limit(limit)
    .lean();

  let results = begins;

  if (results.length < limit) {
    const rest = await Product.find({
      $or: [
        { title_ua: new RegExp(escapeRegExp(q), "i") },
        { title_ru: new RegExp(escapeRegExp(q), "i") },
        { title_en: new RegExp(escapeRegExp(q), "i") },
      ],
      active: true,
      _id: { $nin: begins.map((d: any) => d._id) },
    })
      .select("_id slug title_ua images priceUAH")
      .limit(limit - results.length)
      .lean();

    results = results.concat(rest);
  }

  return NextResponse.json({ products: results });
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
