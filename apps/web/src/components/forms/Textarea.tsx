"use client";

import React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function Textarea({ label, hint, ...props }: Props) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        {...props}
        className={[
          "w-full rounded-md border border-zinc-300 bg-white px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-zinc-400",
          props.className || "",
        ].join(" ")}
      />
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}