import type { HTMLAttributes, ReactNode } from 'react'
import cn from '../utils/cn'

type BadgeType = 'rang-merite' | 'statut-cecg' | 'niveau' | 'default'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  type?: BadgeType
}

const RANG_MERITE_COLORS: Record<string, string> = {
  Semence:        'bg-stone-100 text-stone-600 border-stone-200',
  Pousse:         'bg-green-50 text-green-700 border-green-200',
  Racine:         'bg-amber-50 text-amber-700 border-amber-200',
  Arbre:          'bg-or-clair text-or-fonce border-or',
  'Chêne Gallien':'bg-or text-blanc border-or',
  'Forêt':        'bg-noir text-blanc border-noir',
}

const STATUT_CECG_COLORS: Record<string, string> = {
  aucune:                 'bg-stone-100 text-stone-500 border-stone-200',
  provisoire_solidaire:   'bg-amber-50 text-amber-700 border-amber-200',
  provisoire_parrainage:  'bg-blue-50 text-blue-700 border-blue-200',
  definitive:             'bg-or-clair text-or-fonce border-or',
}

const STATUT_CECG_LABELS: Record<string, string> = {
  aucune:                 'Sans CECG',
  provisoire_solidaire:   'Provisoire Solidaire',
  provisoire_parrainage:  'Provisoire Parrainage',
  definitive:             'Définitive',
}

export default function Badge({ children, type = 'default', className, ...props }: BadgeProps) {
  const content = String(children)

  let colorClasses = 'bg-or-clair text-or-fonce border-or'

  if (type === 'rang-merite' && RANG_MERITE_COLORS[content]) {
    colorClasses = RANG_MERITE_COLORS[content]
  } else if (type === 'statut-cecg' && STATUT_CECG_COLORS[content]) {
    colorClasses = STATUT_CECG_COLORS[content]
  }

  const displayLabel =
    type === 'statut-cecg' ? (STATUT_CECG_LABELS[content] ?? content) : content

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5',
        'text-xs font-body font-semibold uppercase tracking-wider',
        'rounded-full border',
        colorClasses,
        className as string
      )}
      {...props}
    >
      {displayLabel}
    </span>
  )
}
