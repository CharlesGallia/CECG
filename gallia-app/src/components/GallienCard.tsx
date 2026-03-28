import Badge from './Badge'
import GoldRule from './GoldRule'
import cn from '../utils/cn'
import type { Database } from '../lib/supabase'

type Gallien = Database['public']['Tables']['galliens']['Row']

// Couleur du cercle selon le statut CECG
const STATUT_RING: Record<string, string> = {
  definitive:             'ring-2 ring-or',
  provisoire_solidaire:   'ring-2 ring-amber-400',
  provisoire_parrainage:  'ring-2 ring-blue-400',
  aucune:                 'ring-1 ring-gris',
}

// ─── Version MINI (pour l'arbre de parrainage) ──────────────────────────────
interface GallienCardMiniProps {
  gallien: Pick<Gallien, 'prenom' | 'nom' | 'numero_cecg' | 'cecg_statut' | 'rang'>
  isSelf?: boolean
  onClick?: () => void
}

export function GallienCardMini({ gallien, isSelf = false, onClick }: GallienCardMiniProps) {
  const initial = gallien.prenom?.[0]?.toUpperCase() ?? '?'

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 p-3 rounded-sm transition-colors',
        'hover:bg-gris-clair focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-or',
        onClick ? 'cursor-pointer' : 'cursor-default'
      )}
      aria-label={`${gallien.prenom} ${gallien.nom}`}
    >
      {/* Cercle initiale */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center font-body font-semibold text-sm',
          isSelf ? 'bg-or text-blanc' : 'bg-or-clair text-or-fonce',
          STATUT_RING[gallien.cecg_statut] ?? 'ring-1 ring-gris'
        )}
      >
        {initial}
      </div>
      {/* Prénom */}
      <span className="text-xs font-body font-medium text-noir leading-tight text-center max-w-[64px] truncate">
        {gallien.prenom}
      </span>
      {/* Indicateur statut */}
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          gallien.cecg_statut === 'definitive'
            ? 'bg-or'
            : gallien.cecg_statut === 'aucune'
            ? 'bg-gris'
            : 'bg-amber-400'
        )}
        aria-label={`Statut : ${gallien.cecg_statut}`}
      />
    </button>
  )
}

// ─── Version COMPLÈTE (Dashboard, CRM) ──────────────────────────────────────
interface GallienCardFullProps {
  gallien: Gallien
  pointsMerite?: number
  className?: string
}

export function GallienCardFull({ gallien, pointsMerite, className }: GallienCardFullProps) {
  const initial = gallien.prenom?.[0]?.toUpperCase() ?? '?'

  return (
    <div className={cn('bg-blanc border border-gris rounded-sm p-6', className as string)}>
      <div className="flex items-start gap-4">
        {/* Grand cercle initiale */}
        <div
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center shrink-0',
            'font-display font-bold text-xl',
            'bg-or-clair text-or-fonce',
            STATUT_RING[gallien.cecg_statut] ?? 'ring-1 ring-gris'
          )}
          aria-hidden="true"
        >
          {initial}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl font-semibold text-noir leading-tight truncate">
            {gallien.prenom} {gallien.nom}
          </h2>

          {gallien.numero_cecg && (
            <p className="font-body text-sm text-gris-texte mt-0.5 tracking-wider">
              {gallien.numero_cecg}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge type="rang-merite">{gallien.rang}</Badge>
            <Badge type="statut-cecg">{gallien.cecg_statut}</Badge>
          </div>
        </div>
      </div>

      {/* Mérite si fourni */}
      {pointsMerite !== undefined && (
        <>
          <GoldRule className="my-4" />
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-gris-texte">Mérite Gallien</span>
            <span className="font-display text-lg font-bold text-or">
              {pointsMerite.toLocaleString('fr-FR')} pts
            </span>
          </div>
        </>
      )}
    </div>
  )
}
