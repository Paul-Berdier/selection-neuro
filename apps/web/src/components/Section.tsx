export function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-16">
      <div className="max-w-3xl">
        {title ? (
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        ) : null}
        {subtitle ? <p className="mt-3 text-neutral-600">{subtitle}</p> : null}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}