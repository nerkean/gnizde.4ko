import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { cityRef, query } = await req.json();
    const apiKey = process.env.NOVA_POSHTA_KEY;

    if (!cityRef) {
      return NextResponse.json({ success: true, data: [] });
    }

    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      body: JSON.stringify({
        apiKey: apiKey,
        modelName: "Address",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityRef: cityRef,
          FindByString: query || "", 
          Limit: "50",
          Page: "1",
        },
      }),
    });

    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      return NextResponse.json({ success: true, data: data.data });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}