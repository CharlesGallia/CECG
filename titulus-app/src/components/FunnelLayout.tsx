/**
 * Layout commun pour les 6 étapes : Header + Stepper + Main + Footer.
 */
import type { ReactNode } from 'react'
import Header from './Header'
import Stepper from './Stepper'
import type { StepKey } from './Stepper'
import Footer from './Footer'

type Props = {
  step: StepKey
  children: ReactNode
}

export default function FunnelLayout({ step, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-noir text-texte-clair">
      <a className="skip-link" href="#main">Aller au contenu</a>
      <Header />
      <Stepper current={step} />
      <main
        id="main"
        className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-14 animate-fade-up"
      >
        {children}
      </main>
      <Footer />
    </div>
  )
}
