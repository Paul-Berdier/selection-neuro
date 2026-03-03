export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, { cache: "no-store" }).catch((err) => {
    // visible dans logs Railway (server-side)
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
  const url = `${API_URL}${path}`;
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