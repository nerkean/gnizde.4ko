// src/app/fondy/return/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // Fondy присылает order_id
    const orderId = String(form.get("order_id") || "");

    const origin = req.nextUrl.origin;
    const redirectUrl = new URL("/checkout/success", origin);

    if (orderId) {
      redirectUrl.searchParams.set("order_id", orderId);
    }

    // ⬇️ КРИТИЧНО: 303, чтобы следующий запрос был GET, а не POST
    return NextResponse.redirect(redirectUrl, 303);
  } catch (e) {
    console.error("[fondy return] error", e);
    return NextResponse.redirect(
      new URL("/checkout/success", req.nextUrl.origin),
      303
    );
  }
}

// На всякий случай — если кто-то зайдёт GET-ом:
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const redirectUrl = new URL("/checkout/success", origin);
  return NextResponse.redirect(redirectUrl, 302);
}
