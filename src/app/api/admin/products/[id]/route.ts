import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { toSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await ctx.params;

  const item = await Product.findById(id).lean();
  if (!item) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({ ok: true, item });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const update: any = {};

  if (body.title_ua != null) update.title_ua = String(body.title_ua).trim();
  if (body.priceUAH != null) update.priceUAH = Number(body.priceUAH);
  if (body.category != null) update.category = String(body.category).trim();
  if (body.desc_ua != null) update.desc_ua = String(body.desc_ua);
  if (body.stock != null) update.stock = Number(body.stock);
  if (body.active != null) update.active = Boolean(body.active);

  if (body.showDetailsBlocks != null) {
    update.showDetailsBlocks = Boolean(body.showDetailsBlocks);
  }
  
  if (body.details_ua != null) update.details_ua = String(body.details_ua);
  if (body.delivery_ua != null) update.delivery_ua = String(body.delivery_ua);

  if (body.availability != null) {
    const allowedAvail = ["in_stock", "on_order", "out_of_stock"] as const;
    if (allowedAvail.includes(body.availability)) {
      update.availability = body.availability;
    }
  }

  if ("images" in body) {
    update.images = Array.isArray(body.images) ? body.images.map(String) : [];
  }

  if ("slug" in body || "title_ua" in update) {
    const newSlug = String(body.slug || "").trim() || toSlug(update.title_ua || "");
    if (!newSlug) {
      return NextResponse.json({ ok: false, error: "slug required" }, { status: 400 });
    }

    const exists = await Product.exists({ slug: newSlug, _id: { $ne: id } });
    if (exists) {
      return NextResponse.json({ ok: false, error: "slug already exists" }, { status: 409 });
    }

    update.slug = newSlug;
  }

  if (
    update.priceUAH != null &&
    (!Number.isFinite(update.priceUAH) || update.priceUAH < 0)
  ) {
    return NextResponse.json(
      { ok: false, error: "priceUAH must be >= 0" },
      { status: 400 }
    );
  }

  const item = await Product.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true }
  ).lean();

  if (!item) return NextResponse.json({ ok: false }, { status: 404 });

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await ctx.params;

  const deleted = await Product.findByIdAndDelete(id).lean();
  return NextResponse.json(
    { ok: true, id, deleted: !!deleted },
    { status: 200 }
  );
}