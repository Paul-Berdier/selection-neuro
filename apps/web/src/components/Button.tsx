type Props = {
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  type?: "button" | "submit";
};

export function Button({
  href,
  onClick,
  variant = "primary",
  children,
  type = "button",
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium no-underline transition";
  const styles =
    variant === "primary"
      ? "bg-neutral-900 text-white hover:bg-neutral-800"
      : "border border-neutral-300 text-neutral-900 hover:bg-neutral-50";

  if (href) {
    return (
      <a className={`${base} ${styles}`} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}