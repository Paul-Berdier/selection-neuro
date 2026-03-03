import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Selection Neuro – Blagnac",
  description: "Site vitrine + API FastAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen">
          <header className="border-b">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
              <div className="font-semibold tracking-tight">Selection Neuro</div>
              <nav className="flex gap-5 text-sm text-neutral-600">
                <a className="no-underline hover:underline" href="#stacks">Stacks</a>
                <a className="no-underline hover:underline" href="#produits">Produits</a>
                <a className="no-underline hover:underline" href="#invite">Invitation</a>
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-6">{children}</main>

          <footer className="mt-20 border-t">
            <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-neutral-600">
              <div>© {new Date().getFullYear()} Selection Neuro</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}