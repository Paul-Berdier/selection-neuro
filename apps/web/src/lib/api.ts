export const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Only usable server-side (never exposed to browser)
const INTERNAL_API_URL = process.env.API_INTERNAL_URL;

function baseUrl() {
  // Server-side (Next SSR / RSC): prefer private network
  if (typeof window === "undefined" && INTERNAL_API_URL) return INTERNAL_API_URL;
  // Client-side: must be public
  return PUBLIC_API_URL;
}

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, { cache: "no-store" }).catch((err) => {
    console.error("[apiGet] fetch failed:", url, err);
    throw err;
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[apiGet] non-OK:", url, res.status, text);
    throw new Error(`API error ${res.status} on ${path}`);
  }

  return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch((err) => {
    console.error("[apiPost] fetch failed:", url, err);
    throw err;
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[apiPost] non-OK:", url, res.status, text);
    throw new Error(`API error ${res.status} on ${path}`);
  }

  return (await res.json()) as T;
}