import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  const url = new URL("/admin/login", req.url);
  url.searchParams.set("loggedOut", "1");

  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}
