import { NextResponse } from "next/server";

function getUpstreamBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is missing");
  return base.replace(/\/+$/, "");
}

function getAdminToken(): string {
  const t = process.env.ADMIN_TOKEN;
  if (!t) throw new Error("ADMIN_TOKEN is missing");
  return t;
}

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const base = getUpstreamBase();
    const token = getAdminToken();
    const { slug } = await ctx.params;

    const upstream = await fetch(`${base}/admin/products/${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: { "X-Admin-Token": token },
      cache: "no-store",
    });

    const text = await upstream.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const base = getUpstreamBase();
    const token = getAdminToken();
    const { slug } = await ctx.params;

    const form = await req.formData();

    const upstream = await fetch(`${base}/admin/products/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "X-Admin-Token": token },
      body: form,
    });

    const text = await upstream.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const base = getUpstreamBase();
    const token = getAdminToken();
    const { slug } = await ctx.params;

    const upstream = await fetch(`${base}/admin/products/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": token },
    });

    const text = await upstream.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}