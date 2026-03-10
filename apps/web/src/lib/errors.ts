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

/**
 * Alias "safe" souvent utilisé dans l'UI.
 * (garde la compat avec les anciens imports)
 */
export function getErrorMessage(err: unknown): string {
  return formatApiError(err);
}