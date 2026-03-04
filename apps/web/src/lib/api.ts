// apps/web/src/lib/api.ts

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is missing");
  return base.replace(/\/+$/, "");
}

function makeUrl(path: string): string {
  const base = apiBase();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = makeUrl(path);
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[apiGet] non-OK:", url, res.status, text);
    throw new Error(`API error ${res.status} on ${path}`);
  }

  return (await res.json()) as T;
}

/**
 * POST JSON helper (used by src/app/page.tsx in your project)
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiJson<T>(path, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const url = makeUrl(path);

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    console.error("[apiJson] non-OK:", url, res.status, data);
    throw new Error(`API error ${res.status} on ${path}`);
  }

  return data as T;
}