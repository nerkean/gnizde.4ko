import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-auth";
import { connectDB } from "@/lib/mongodb";
import ContentBlock from "@/models/ContentBlock";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

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
    console.error("⚠️ Помилка:", e);
  }

  if (username !== validUser || password !== validPass) {
    return NextResponse.json({ success: false, error: "Невірний логін або пароль" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  
  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production", 
    maxAge: 60 * 60 * 8,
  });
  
  return res;
}