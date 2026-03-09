// apps/web/src/components/auth/AuthIndicator.tsx
import Link from "next/link";
import { cookies } from "next/headers";

export function AuthIndicator() {
  const token = cookies().get("access_token")?.value;

  if (token) {
    return (
      <form action="/account/logout" className="inline">
        <button className="text-sm underline-offset-4 hover:underline" type="submit">
          Se déconnecter
        </button>
      </form>
    );
  }

  return (
    <Link className="no-underline hover:underline" href="/account/login">
      Se connecter
    </Link>
  );
}