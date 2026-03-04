"use client";

import React from "react";

type Option = { value: string; label: string };

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Option[];
  hint?: string;
};

export function Select({ label, options, hint, ...props }: Props) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium">{label}</span>
      <select
        {...props}
        className={[
          "w-full rounded-md border border-zinc-300 bg-white px-3 py-2",
          "focus:outline-none focus:ring-2 focus:ring-zinc-400",
          props.className || "",
        ].join(" ")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
    </label>
  );
}