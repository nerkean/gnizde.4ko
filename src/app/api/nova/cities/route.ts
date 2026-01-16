import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const apiKey = process.env.NOVA_POSHTA_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "No API Key" }, { status: 500 });
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      body: JSON.stringify({
        apiKey: apiKey,
        modelName: "Address",
        calledMethod: "searchSettlements",
        methodProperties: {
          CityName: query,
          Limit: "50",
          Page: "1",
        },
      }),
    });

    const data = await res.json();

    if (data.success && data.data && data.data.length > 0) {
      const items = data.data[0].Addresses.map((item: any) => ({
        Description: item.Present,
        Ref: item.DeliveryCity,
      }));

      return NextResponse.json({ success: true, data: items });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (e) {
    console.error("Nova Poshta API Error:", e);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}