import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin");

  const U = process.env.ADMIN_USER || "admin";
  const P = process.env.ADMIN_PASS || "admin";

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://pavuk.onrender.com";

  // ❌ Неправильный логин → редирект назад
  if (username !== U || password !== P) {
    const url = new URL("/admin/login", baseUrl);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  // ✅ Успешный логин → редирект на /admin
  const res = NextResponse.redirect(new URL(next, baseUrl));
  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true, // Render использует HTTPS
    maxAge: 60 * 60 * 8, // 8 часов
  });
  return res;
}
