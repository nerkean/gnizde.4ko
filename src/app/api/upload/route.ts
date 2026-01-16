import { NextResponse } from "next/server";
import ImageKit from "imagekit";

export const runtime = "nodejs";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: Request) {
  try {
    const { file, fileName } = await req.json();

    const payload =
      typeof file === "string" && file.startsWith("data:")
        ? file
        : `data:image/*;base64,${file}`;

    const upload = await imagekit.upload({
      file: payload,
      fileName: fileName || `upload_${Date.now()}.jpg`,
    });

    return NextResponse.json({ ok: true, url: upload.url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
