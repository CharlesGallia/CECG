/**
 * Header impérial — présent sur toutes les pages du funnel.
 *
 * Composition (cf. Cahier des Charges §3.3) :
 *   [Blason rond gauche]   IMPERIO GALLORUM SOCIATIS    [italique droite]
 *                          CONSULAT DE GALLIA · GIFTER   Gallia Aeterna
 *                          SIREN 533 624 649
 */
import Blason from '../assets/Blason'

export default function Header() {
  return (
    <header
      role="banner"
      className="relative w-full bg-noir border-b border-or/30 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 grid grid-cols-[auto_1fr_auto] items-center gap-4 sm:gap-6">
        {/* Blason gauche */}
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 rounded-full bg-or/20 blur-xl" />
          <div className="relative">
            <Blason size={56} className="sm:!w-[68px] sm:!h-[68px]" />
          </div>
        </div>

        {/* Bloc texte centré */}
        <div className="text-center min-w-0">
          <div className="font-cinzel text-or text-base sm:text-xl tracking-imperial-wide font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            IMPERIO GALLORUM SOCIATIS
          </div>
          <div className="font-sans text-[10px] sm:text-xs uppercase tracking-imperial-tight text-or-pale/80 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
            Consulat de Gallia · GIFTER
          </div>
          <div className="font-sans text-[10px] sm:text-xs text-texte-muet mt-0.5 underline underline-offset-2 decoration-or/40">
            SIREN 533&nbsp;624&nbsp;649
          </div>
        </div>

        {/* Mention italique droite */}
        <div className="hidden sm:block text-right shrink-0">
          <div className="font-cormorant italic text-or-pale text-lg leading-tight">
            Gallia
          </div>
          <div className="font-cormorant italic text-or-pale text-lg leading-tight">
            Aeterna
          </div>
        </div>
      </div>

      {/* Filet doré de séparation */}
      <div className="filet-or" />
    </header>
  )
}
