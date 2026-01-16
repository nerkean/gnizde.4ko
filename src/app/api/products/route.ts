import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET() {
  await connectDB();
  const products = await Product.find({ active: true })
    .select({ title_ua: 1, priceUAH: 1, images: 1 })
    .lean();
  return NextResponse.json({ ok: true, products });
}
