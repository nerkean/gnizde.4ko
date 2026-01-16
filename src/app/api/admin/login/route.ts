import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import ContentBlock from "@/models/ContentBlock";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const username = String(form.get("username") || "");
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/admin");

  let validUser = process.env.ADMIN_USER || "admin";
  let validPass = process.env.ADMIN_PASS || "admin";

  try {
    await connectDB();
    const settings = await ContentBlock.findOne({ key: "admin.settings" }).lean() as any;

    if (settings && settings.data) {
      if (settings.data.login) validUser = settings.data.login;
      if (settings.data.password) validPass = settings.data.password;
    }
  } catch (e) {
    console.error("⚠️ Failed to fetch admin creds from DB, using defaults:", e);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gnizde4ko.onrender.com";

  if (username !== validUser || password !== validPass) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production", 
    maxAge: 60 * 60 * 8,
  });
  
  return res;
}