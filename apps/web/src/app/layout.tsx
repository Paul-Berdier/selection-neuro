import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import UTMCapture from '@/components/UTMCapture'

export const metadata: Metadata = {
  title: 'Sélection Neuro — Soutien cognitif',
  description: 'Compléments nootropiques en formes actives, dosages cliniques. Blagnac, Toulouse.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <UTMCapture />
            <main style={{ minHeight: '80vh' }}>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
