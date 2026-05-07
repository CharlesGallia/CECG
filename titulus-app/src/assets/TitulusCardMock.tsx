/**
 * Maquette de la carte Titulus Civilis (recto) — affichée sur l'étape I & VI.
 * Reproduit fidèlement le rendu de la carte physique : fond noir, bande or "PRIMUM NON NOCERE",
 * bloc état civil, photo placeholder.
 */
type Props = {
  prenom?: string
  nom?: string
  className?: string
}

export default function TitulusCardMock({ prenom = 'Charles', nom = 'POURLIER', className = '' }: Props) {
  return (
    <div
      className={
        'relative w-full max-w-[480px] aspect-[1.585/1] rounded-[14px] overflow-hidden ' +
        'bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#000] ' +
        'shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(201,168,76,0.35)] ' +
        'ring-1 ring-or/30 ' + className
      }
      style={{ fontFamily: 'Cormorant Garamond, serif' }}
    >
      {/* Reflets dorés */}
      <div className="absolute inset-0 bg-gradient-to-tr from-or/0 via-or/5 to-or/15 pointer-events-none" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-or/10 rounded-full blur-3xl" />

      {/* Ligne haut : titre */}
      <div className="absolute inset-x-0 top-0 px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="w-7 h-7 rounded-full border border-or/60 flex items-center justify-center">
            <span className="text-or text-[10px]">⚜</span>
          </div>
          <div className="font-cinzel text-or text-[13px] sm:text-[15px] tracking-imperial-wide font-semibold">
            IMPERIO GALLORUM SOCIATIS
          </div>
          <div className="w-7 h-7 rounded-full border border-or/60 flex items-center justify-center">
            <span className="text-or text-[10px]">⚜</span>
          </div>
        </div>
        <div className="mt-1 h-px bg-gradient-to-r from-transparent via-or to-transparent opacity-60" />
        <div className="mt-1 text-center text-or-pale italic text-[11px] sm:text-[13px]">
          Titulus Civilis · Carte nationale d'état civil
        </div>
      </div>

      {/* Corps */}
      <div className="absolute inset-x-0 top-[34%] bottom-[18%] px-4 flex gap-3 items-center">
        {/* Photo */}
        <div className="w-[28%] aspect-square rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-2 ring-or/50 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 text-or/40" fill="currentColor">
            <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-3 0-9 1.5-9 4.5V21h18v-2.5c0-3-6-4.5-9-4.5z"/>
          </svg>
        </div>
        {/* Texte état civil */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-texte-clair text-[11px] sm:text-[13px] flex-1">
          <div>
            <div className="text-or-pale/70 text-[9px] sm:text-[10px]">Nom</div>
            <div className="font-semibold text-[13px] sm:text-[15px]">{nom.toUpperCase()}</div>
          </div>
          <div>
            <div className="text-or-pale/70 text-[9px] sm:text-[10px]">Prénom</div>
            <div className="font-semibold text-[13px] sm:text-[15px]">{prenom}</div>
          </div>
          <div>
            <div className="text-or-pale/70 text-[9px] sm:text-[10px]">Sexe</div>
            <div className="font-semibold">M</div>
          </div>
          <div>
            <div className="text-or-pale/70 text-[9px] sm:text-[10px]">Nationalité</div>
            <div className="font-semibold">Gal.</div>
          </div>
        </div>
      </div>

      {/* Bande "PRIMUM NON NOCERE" */}
      <div className="absolute inset-x-3 bottom-3">
        <div className="h-6 sm:h-7 bg-gradient-to-r from-or via-or-pale to-or rounded-sm flex items-center justify-center">
          <span className="font-cinzel text-noir text-[10px] sm:text-[12px] tracking-imperial font-bold">
            PRIMUM NON NOCERE · Galli'An 1 · MMXXVI
          </span>
        </div>
        <div className="mt-1 text-right text-or-pale/60 text-[9px] sm:text-[10px] tracking-wider font-mono">
          20260504-091954-609
        </div>
      </div>
    </div>
  )
}
