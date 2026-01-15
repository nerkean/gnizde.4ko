import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { q } = await req.json();
    const apiKey = process.env.NOVA_POSHTA_API_KEY;
    if (!apiKey) throw new Error("Missing NOVA_POSHTA_API_KEY");

    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        modelName: "Address",
        calledMethod: "getCities",
        methodProperties: {
          FindByString: q || "",
          Limit: 10,
        },
      }),
    });

    const data = await res.json();
    const items =
      data?.data?.map((c: any) => ({
        name: c.Description,
        ref: c.Ref,
      })) || [];

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
