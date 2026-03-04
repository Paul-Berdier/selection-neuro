"use client";

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: any }) {
  const styles =
    kind === "error"
      ? "border-red-300 bg-red-50 text-red-900"
      : kind === "success"
      ? "border-green-300 bg-green-50 text-green-900"
      : "border-zinc-300 bg-zinc-50 text-zinc-900";

  return <div className={`mt-4 rounded-md border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}