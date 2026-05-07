/**
 * Sur-titre + titre principal d'une étape, avec filet or court.
 */
import type { ReactNode } from 'react'

type Props = {
  surtitre?: string
  titre: ReactNode
  soustitre?: ReactNode
  citation?: ReactNode
  align?: 'left' | 'center'
}

export default function SectionTitle({ surtitre, titre, soustitre, citation, align = 'center' }: Props) {
  const t = align === 'center' ? 'text-center' : 'text-left'
  return (
    <div className={t + ' space-y-3 mb-10'}>
      {surtitre && (
        <div className="font-cinzel text-xs sm:text-sm tracking-imperial-wide uppercase text-or-pale/80">
          {surtitre}
        </div>
      )}
      <h1 className="font-cinzel font-semibold tracking-imperial text-3xl sm:text-4xl lg:text-5xl text-texte-clair leading-tight">
        {titre}
      </h1>
      {align === 'center' && <div className="filet-or-court" />}
      {soustitre && (
        <p className="font-cormorant text-lg sm:text-xl text-or-pale italic max-w-2xl mx-auto">
          {soustitre}
        </p>
      )}
      {citation && (
        <blockquote className="font-cormorant italic text-or-pale/90 text-base sm:text-lg max-w-2xl mx-auto pt-3 border-l-2 border-cardinal pl-4 text-left mx-auto">
          {citation}
        </blockquote>
      )}
    </div>
  )
}
