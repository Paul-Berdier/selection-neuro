// apps/web/src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CartIndicator } from "@/components/cart/CartIndicator";
import { AuthIndicator } from "@/components/auth/AuthIndicator";

export const metadata: Metadata = {
  title: "Selection Neuro",
  description: "E-commerce – Selection Neuro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen">
          <header className="border-b">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
              <Link href="/" className="font-semibold tracking-tight no-underline">
                Selection Neuro
              </Link>

              <nav className="flex items-center gap-5 text-sm text-neutral-700">
                <Link className="no-underline hover:underline" href="/products">
                  Produits
                </Link>
                <Link className="no-underline hover:underline" href="/cart">
                  Panier <CartIndicator />
                </Link>
                <Link className="no-underline hover:underline" href="/account/orders">
                  Commandes
                </Link>
                <AuthIndicator />
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