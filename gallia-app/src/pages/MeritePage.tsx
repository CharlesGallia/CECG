import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Users, TrendingUp, Target, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMerite, getRangSuivant, RANGS_MERITE } from '../hooks/useMerite'
import PageLayout from '../components/PageLayout'

interface GainRow {
  id: string
  type: string
  montant_gl: number
  merite_genere: number
  description: string | null
  created_at: string
}

// Compteur anime
function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const [displayed, setDisplayed] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    if (start === end) return

    const duration = 800
    const steps = 40
    const stepValue = (end - start) / steps
    let step = 0

    const interval = setInterval(() => {
      step++
      setDisplayed(Math.round(start + stepValue * step))
      if (step >= steps) {
        setDisplayed(end)
        prevRef.current = end
        clearInterval(interval)
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [value])

  return (
    <span className={className}>
      {displayed.toLocaleString('fr-FR')}
    </span>
  )
}

const CATEGORIE_CONFIG = {
  parrainages:  { label: 'Parrainages',  icon: Users,       color: 'text-blue-600',  bg: 'bg-blue-50' },
  commissions:  { label: 'Commissions',  icon: TrendingUp,  color: 'text-green-600', bg: 'bg-green-50' },
  missions:     { label: 'Missions',     icon: Target,      color: 'text-purple-600',bg: 'bg-purple-50' },
  anciennete:   { label: 'Anciennete',   icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-50' },
}

export default function MeritePage() {
  const { gallien, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { merite } = useMerite(gallien?.id)
  const [gains, setGains] = useState<GainRow[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/')
  }, [loading, isAuthenticated, navigate])

  useEffect(() => {
    if (!gallien) return
    supabase
      .from('transactions_gl')
      .select('id, type, montant_gl, merite_genere, description, created_at')
      .or(`destinataire_id.eq.${gallien.id},expediteur_id.eq.${gallien.id}`)
      .gt('merite_genere', 0)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setGains(data as GainRow[]) })
  }, [gallien])

  const points = merite?.points_total ?? 0
  const { courant, suivant, progressPct } = getRangSuivant(points)

  const categories = [
    { key: 'parrainages', pts: merite?.points_parrainages ?? 0 },
    { key: 'commissions', pts: merite?.points_commissions ?? 0 },
    { key: 'missions',    pts: merite?.points_missions ?? 0 },
    { key: 'anciennete',  pts: merite?.points_anciennete ?? 0 },
  ] as const

  return (
    <PageLayout withSidebar>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-noir mb-1">Merite Gallien</h1>
        <p className="font-body text-sm text-gris-texte">
          Ton compteur permanent — il ne diminue jamais.
        </p>
      </div>

      {/* Compteur principal */}
      <div className="bg-noir rounded-sm p-8 text-center mb-6">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-blanc/50 mb-3">
          Points totaux
        </p>
        <AnimatedCounter
          value={points}
          className="font-display text-6xl sm:text-7xl font-bold text-or"
        />
        <p className="font-body text-sm text-blanc/60 mt-2">{courant.rang}</p>

        {suivant && (
          <div className="mt-6">
            <div className="flex justify-between mb-1.5">
              <span className="font-body text-xs text-blanc/40">{courant.rang}</span>
              <span className="font-body text-xs text-blanc/40">{suivant.rang}</span>
            </div>
            <div className="w-full bg-blanc/10 rounded-full h-2">
              <div
                className="bg-or h-2 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="font-body text-xs text-blanc/40 mt-2">
              {(suivant.min - points).toLocaleString('fr-FR')} pts pour atteindre {suivant.rang}
            </p>
          </div>
        )}

        <p className="font-display text-xs text-blanc/30 italic mt-6">
          Ce compteur ne diminue jamais.
        </p>
      </div>

      {/* Bareme des rangs */}
      <div className="bg-blanc border border-gris rounded-sm p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-noir mb-4">
          Bareme des rangs
        </h2>
        <div className="space-y-3">
          {RANGS_MERITE.map((rang) => {
            const isActuel = rang.rang === courant.rang
            const isAtteint = points >= rang.min
            return (
              <div
                key={rang.rang}
                className={`flex items-center justify-between py-2.5 px-3 rounded-sm transition-colors ${
                  isActuel ? 'bg-or-clair border border-or' : 'border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isAtteint ? 'bg-or' : 'bg-gris'
                  }`} />
                  <p className={`font-body text-sm font-medium ${isActuel ? 'text-or-fonce' : 'text-noir'}`}>
                    {rang.rang}
                    {isActuel && (
                      <span className="ml-2 font-body text-xs font-normal text-or bg-or/10 px-2 py-0.5 rounded-full">
                        Rang actuel
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-body text-xs text-gris-texte shrink-0">
                  {rang.min === 0 ? '0' : rang.min.toLocaleString('fr-FR')}
                  {rang.max !== Infinity ? ` — ${rang.max.toLocaleString('fr-FR')}` : '+'}
                  {' '}pts
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail par categorie */}
      <div className="bg-blanc border border-gris rounded-sm p-6 mb-6">
        <h2 className="font-display text-lg font-semibold text-noir mb-4">
          Detail par categorie
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map(({ key, pts }) => {
            const cfg = CATEGORIE_CONFIG[key]
            const Icon = cfg.icon
            const pct = points > 0 ? Math.round((pts / points) * 100) : 0
            return (
              <div key={key} className={`rounded-sm p-4 ${cfg.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={14} className={cfg.color} />
                  <p className="font-body text-xs font-medium text-noir">{cfg.label}</p>
                </div>
                <p className={`font-display text-2xl font-bold ${cfg.color}`}>
                  {pts.toLocaleString('fr-FR')}
                </p>
                <p className="font-body text-[11px] text-gris-texte mt-0.5">{pct}% du total</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Historique des gains */}
      <div className="bg-blanc border border-gris rounded-sm p-6">
        <h2 className="font-display text-lg font-semibold text-noir mb-4">
          Historique des gains
        </h2>
        {gains.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <Zap size={28} className="text-gris-texte" />
            <p className="font-body text-sm text-gris-texte">Aucun gain enregistre pour le moment.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {gains.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-2 border-b border-gris last:border-0">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-or-clair border border-or flex items-center justify-center shrink-0 mt-0.5">
                    <Zap size={12} className="text-or" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm text-noir truncate">
                      {g.description ?? g.type}
                    </p>
                    <p className="font-body text-[11px] text-gris-texte mt-0.5">
                      {new Date(g.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="font-body text-sm font-semibold text-or">
                    +{g.merite_genere} pts
                  </p>
                  {g.montant_gl > 0 && (
                    <p className="font-body text-xs text-gris-texte">
                      +{Number(g.montant_gl).toFixed(2)} GL
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageLayout>
  )
}
