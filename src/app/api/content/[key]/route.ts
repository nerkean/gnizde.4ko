import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ContentBlock from "@/models/ContentBlock";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ key: string }> };

// ---------------- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ALT ----------------

function autoFillAlt(key: string, rawData: any) {
  const data = rawData || {};
  const k = key || "";

  // небольшая функция, чтобы не падать, если чего-то нет
  const clone = <T,>(v: T): T =>
    v && typeof v === "object" ? JSON.parse(JSON.stringify(v)) : v;

  const next: any = clone(data);

  // Базовый ALT для images по ключу блока
  const baseImageAlt = (() => {
    if (k === "home.hero") return "Головне зображення першого екрану";
    if (k === "home.features") return "Зображення блоку «Особливості»";
    if (k === "home.giftStory") return "Зображення блоку «Подарункова історія»";
    if (k === "home.about") return "Зображення блоку «Про майстерню»";
    if (k === "catalog.categories") return "Зображення категорії каталогу";
    if (k.startsWith("home.")) return "Зображення блоку головної сторінки";
    return "Зображення сайту";
  })();

  // ----- 1) data.images: hero / about / любые блоки с images -----
  if (Array.isArray(next.images)) {
    next.images = next.images.map((img: any, index: number) => {
      const titleUa =
        (next.title && next.title.ua) ||
        (next.heading && next.heading.ua) ||
        "";
      const altFromTitle = titleUa
        ? `${baseImageAlt}: ${titleUa}`
        : `${baseImageAlt} №${index + 1}`;

      return {
        ...img,
        alt: img?.alt && img.alt.ua
          ? img.alt
          : { ua: altFromTitle },
      };
    });
  }

  // ----- 2) data.stories: для Подарункова історія (gallery) -----
  if (Array.isArray(next.stories)) {
    next.stories = next.stories.map((story: any, index: number) => {
      const titleUa = story?.title?.ua?.trim();
      const base =
        titleUa && titleUa.length > 0
          ? `Історія: ${titleUa}`
          : `Історія №${index + 1}`;
      return {
        ...story,
        alt: story?.alt && story.alt.ua ? story.alt : { ua: base },
      };
    });
  }

  // ----- 3) data.categories: для Категорії каталогу -----
  if (Array.isArray(next.categories)) {
    next.categories = next.categories.map((cat: any) => {
      const titleUa = cat?.title?.ua || "";
      const slug = cat?.slug || "";
      const label =
        titleUa && titleUa.length > 0
          ? `Категорія: ${titleUa}`
          : slug
          ? `Категорія: ${slug}`
          : "Категорія каталогу";

      if (!cat.image) {
        return cat; // если картинки нет — пропускаем
      }

      const image = cat.image;
      return {
        ...cat,
        image: {
          ...image,
          alt: image?.alt && image.alt.ua ? image.alt : { ua: label },
        },
      };
    });
  }

  return next;
}

// ---------------- GET ----------------
export async function GET(_req: Request, ctx: Ctx) {
  try {
    await connectDB();
    const { key } = await ctx.params;
    const doc = await ContentBlock.findOne({ key });

    if (!doc)
      return NextResponse.json({ ok: true, doc: null }, { status: 200 });

    return NextResponse.json({ ok: true, doc }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// ---------------- POST / PUT ----------------
async function upsertBlock(req: Request, ctx: Ctx) {
  await connectDB();
  const { key } = await ctx.params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // 🪄 тут накручиваем ALT, если его нет
  const dataWithAlt = autoFillAlt(key, body?.data ?? {});

  const update = {
    key,
    type: body?.type ?? "hero",
    data: dataWithAlt,
    draft: !!body?.draft,
    version: typeof body?.version === "number" ? body.version : 1,
    updatedBy: body?.updatedBy ?? "content_editor",
  };

  const doc = await ContentBlock.findOneAndUpdate(
    { key },
    { $set: update },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, doc }, { status: 200 });
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    return await upsertBlock(req, ctx);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    return await upsertBlock(req, ctx);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
