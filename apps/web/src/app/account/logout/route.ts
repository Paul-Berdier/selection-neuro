// apps/web/src/app/account/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies(); // ✅
  cookieStore.delete("access_token");

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://selectioneuro.up.railway.app";
  return NextResponse.redirect(new URL("/", base));
}