// apps/web/src/app/account/register/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction, loginAction } from "@/app/account/actions";
import { Section } from "@/components/Section";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  async function action(formData: FormData) {
    "use server";
    await registerAction(formData);
    await loginAction(formData);
    redirect("/cart");
  }

  return (
    <Section title="Créer un compte" subtitle="En 30 secondes, tu peux commander.">
      <div className="max-w-md">
        <form action={action} className="grid gap-4">
          <div className="grid gap-1">
            <label className="text-sm text-neutral-700">Email</label>
            <input name="email" type="email" required className="border rounded px-3 py-2" />
          </div>

          <div className="grid gap-1">
            <label className="text-sm text-neutral-700">Mot de passe</label>
            <input name="password" type="password" required className="border rounded px-3 py-2" />
          </div>

          <button className="border rounded px-3 py-2 bg-black text-white" type="submit">
            Créer le compte
          </button>

          <div className="text-sm text-neutral-600">
            Déjà un compte ? <Link className="underline" href="/account/login">Se connecter</Link>
          </div>
        </form>
      </div>
    </Section>
  );
}