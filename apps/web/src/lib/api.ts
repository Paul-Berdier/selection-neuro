// apps/web/src/lib/api.ts

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is missing");
  return base.replace(/\/+$/, "");
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = apiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[apiGet] non-OK:", url, res.status, text);
    throw new Error(`API error ${res.status} on ${path}`);
  }

  return (await res.json()) as T;
}