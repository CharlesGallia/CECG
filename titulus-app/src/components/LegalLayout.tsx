import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

type Props = {
  title: string
  children: ReactNode
}

export default function LegalLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-noir">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-12">
        <Link to="/" className="text-or-pale hover:text-or text-sm uppercase tracking-imperial-tight font-sans mb-6 inline-block">
          ← Retour au funnel
        </Link>
        <h1 className="font-cinzel text-or text-3xl tracking-imperial uppercase font-semibold mb-2">{title}</h1>
        <div className="filet-or my-6" />
        <div className="font-cormorant text-lg leading-relaxed text-texte-clair space-y-4">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
