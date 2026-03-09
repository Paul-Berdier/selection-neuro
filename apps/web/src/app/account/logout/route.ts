// apps/web/src/app/account/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("access_token");
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "https://selectioneuro.up.railway.app"));
}