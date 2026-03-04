import { NextResponse } from "next/server";

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

type Ctx = { params: Promise<{ slug: string }> };

function upstreamBase(): string {
  return mustEnv("NEXT_PUBLIC_API_URL").replace(/\/+$/, "");
}

function adminToken(): string {
  return mustEnv("ADMIN_TOKEN");
}

async function parseUpstreamResponse(upstream: Response) {
  const text = await upstream.text().catch(() => "");
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;

    const upstream = await fetch(`${upstreamBase()}/admin/products/${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: { "X-Admin-Token": adminToken() },
      cache: "no-store",
    });

    const data = await parseUpstreamResponse(upstream);
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const form = await req.formData();

    const upstream = await fetch(`${upstreamBase()}/admin/products/${encodeURIComponent(slug)}`, {
      method: "PUT",
      headers: { "X-Admin-Token": adminToken() },
      body: form,
    });

    const data = await parseUpstreamResponse(upstream);
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;

    const upstream = await fetch(`${upstreamBase()}/admin/products/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": adminToken() },
    });

    const data = await parseUpstreamResponse(upstream);
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}