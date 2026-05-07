/**
 * Stepper horizontal — 6 cercles numérotés en chiffres romains (I à VI),
 * reliés par des lignes or fines.
 *
 * Étape active : cercle rempli or, halo doré
 * Étapes franchies : cercle plein or saturé
 * Étapes futures : outline or terne (#5A4D2A)
 */
import { cn } from '../utils/cn'

export type StepKey = 'identite' | 'adhesion' | 'declaratio' | 'signature' | 'kyc' | 'confirmation'

const STEPS: Array<{ key: StepKey; label: string; roman: string }> = [
  { key: 'identite',     label: 'Identité',    roman: 'I' },
  { key: 'adhesion',     label: 'Adhésion',    roman: 'II' },
  { key: 'declaratio',   label: 'Declaratio',  roman: 'III' },
  { key: 'signature',    label: 'Signature',   roman: 'IV' },
  { key: 'kyc',          label: 'KYC',         roman: 'V' },
  { key: 'confirmation', label: 'Confirmatio', roman: 'VI' },
]

type Props = { current: StepKey }

export default function Stepper({ current }: Props) {
  const currentIdx = STEPS.findIndex((s) => s.key === current)

  return (
    <nav
      aria-label="Progression du funnel d'adhésion"
      className="w-full bg-noir border-b border-or/15 py-6 sm:py-8 overflow-x-auto"
    >
      <ol className="flex items-center justify-between min-w-[640px] max-w-3xl mx-auto px-4 sm:px-8">
        {STEPS.map((step, i) => {
          const status: 'done' | 'current' | 'future' =
            i < currentIdx ? 'done' : i === currentIdx ? 'current' : 'future'

          return (
            <li key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-label={`Étape ${step.roman} — ${step.label}${status === 'done' ? ' (franchie)' : status === 'current' ? ' (en cours)' : ''}`}
                  className={cn(
                    'relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                    'font-cinzel font-semibold text-sm sm:text-base transition-all duration-300',
                    status === 'done'   && 'bg-or text-noir border-2 border-or',
                    status === 'current' && 'bg-or text-noir border-2 border-or animate-pulse-or',
                    status === 'future' && 'bg-noir-2 text-or-terne border-2 border-or-terne',
                  )}
                >
                  {step.roman}
                </div>
                <span
                  className={cn(
                    'font-sans text-[10px] sm:text-xs uppercase tracking-imperial-tight whitespace-nowrap',
                    status === 'current' ? 'text-or' : status === 'done' ? 'text-or-pale' : 'text-or-terne',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className={cn(
                    'h-px flex-1 mx-2 sm:mx-3 mb-6 transition-colors',
                    i < currentIdx ? 'bg-or' : 'bg-or-terne/60',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
