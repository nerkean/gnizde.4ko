import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}&countrycodes=ua&format=json&limit=10&accept-language=uk`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Gnizde4ko-Shop/1.0"
      }
    });

    if (!res.ok) throw new Error("OSM API Error");

    const data = await res.json();

    const formatted = data.map((item: any) => {
      const parts = item.display_name.split(", ");
      const name = parts[0];
      const region = parts.find((p: string) => p.includes("область")) || "";
      
      return {
        Description: region ? `${name}, ${region}` : name,
        Ref: name,
      };
    });

    return NextResponse.json({ success: true, data: formatted });

  } catch (e: any) {
    console.error("OSM API Error:", e.message);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}