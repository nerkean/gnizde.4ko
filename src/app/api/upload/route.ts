import { NextResponse } from "next/server";
import ImageKit from "imagekit";

// ВАЖНО: этот роут должен работать в NodeJS, не на Edge
export const runtime = "nodejs";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  try {
    const { file, fileName } = await req.json();

    // поддержим и data:URL, и “чистый” base64
    const payload =
      typeof file === "string" && file.startsWith("data:")
        ? file
        : `data:image/*;base64,${file}`;

    const upload = await imagekit.upload({
      file: payload,   // base64 dataURL или URL файла
      fileName: fileName || `upload_${Date.now()}.jpg`,
    });

    return NextResponse.json({ ok: true, url: upload.url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
