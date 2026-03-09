// apps/web/src/app/account/login/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/account/actions";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  async function action(formData: FormData) {
    "use server";
    await loginAction(formData);
    redirect("/cart");
  }

  return (
    <Section title="Connexion" subtitle="Accède à ton panier et à tes commandes.">
      <div className="max-w-md">
        <form action={action} className="grid gap-4">
          <div className="grid gap-1">
            <label className="text-sm text-neutral-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="border rounded px-3 py-2"
              placeholder="you@mail.com"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-neutral-700">Mot de passe</label>
            <input
              name="password"
              type="password"
              required
              className="border rounded px-3 py-2"
              placeholder="••••••••"
            />
          </div>

          <button className="border rounded px-3 py-2 bg-black text-white" type="submit">
            Se connecter
          </button>

          <div className="text-sm text-neutral-600">
            Pas de compte ? <Link className="underline" href="/account/register">Créer un compte</Link>
          </div>
        </form>
      </div>
    </Section>
  );
}