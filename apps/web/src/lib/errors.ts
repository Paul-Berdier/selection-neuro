// apps/web/src/lib/errors.ts

export function formatApiError(err: unknown): string {
  if (err instanceof Error) return err.message;

  try {
    if (typeof err === "string") return err;
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}