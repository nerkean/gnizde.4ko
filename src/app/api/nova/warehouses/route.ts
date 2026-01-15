import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cityRef } = await req.json();
    const apiKey = process.env.NOVA_POSHTA_API_KEY;
    if (!apiKey) throw new Error("Missing NOVA_POSHTA_API_KEY");

    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        modelName: "Address",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityRef: cityRef,
          Limit: 50,
        },
      }),
    });

    const data = await res.json();
    const items =
      data?.data?.map((w: any) => ({
        name: w.Description,
        ref: w.Ref,
      })) || [];

    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message });
  }
}
