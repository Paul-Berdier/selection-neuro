// apps/web/src/components/Section.tsx
import type { ReactNode } from "react";

type Props = {
  id?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Section({ id, title, subtitle, actions, children }: Props) {
  return (
    <section id={id} className="py-10">
      {(title || subtitle || actions) && (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title ? <h2 className="text-2xl font-semibold">{title}</h2> : null}
            {subtitle ? (
              <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
            ) : null}
          </div>

          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}

      {children}
    </section>
  );
}