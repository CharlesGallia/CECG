import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Copy, Check, TrendingUp, Users, Zap, Bell, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMerite, getRangSuivant } from '../hooks/useMerite'
import { useReseau } from '../hooks/useReseau'
import PageLayout from '../components/PageLayout'
import Badge from '../components/Badge'
import GoldRule from '../components/GoldRule'
import { getLienParrainage, genererQRCode, copierDansPresseP } from '../utils/parrainage'
import type { Database } from '../lib/supabase'

type Notif = Database['public']['Tables']['notifications']['Row']
type Transaction = Database['public']['Tables']['transactions_gl']['Row']

// ─── Widget Identite ──────────────────────────────────────────────────────────
function WidgetIdentite() {
  const { gallien } = useAuth()
  if (!gallien) return null

  const isProvisoire = gallien.cecg_statut.startsWith('provisoire')

  return (
    <div className="bg-noir text-blanc rounded-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-or flex items-center justify-center shrink-0">
          <span className="font-display text-2xl font-bold text-blanc">
            {gallien.prenom?.[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold text-blanc leading-tight">
            {gallien.prenom} {gallien.nom}
          </h1>
          <p className="font-body text-sm text-blanc/60 mt-0.5 tracking-wider">
            {gallien.numero_cecg ?? "Numero en cours d'attribution"}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge type="rang-merite">{gallien.rang}</Badge>
            <Badge type="statut-cecg">{gallien.cecg_statut}</Badge>
          </div>
        </div>
      </div>

      {isProvisoire && (
        <div className="mt-5 pt-5 border-t border-blanc/10">
          <div className="flex justify-between mb-1.5">
            <p className="font-body text-xs text-blanc/60">Carte provisoire active</p>
            <p className="font-body text-xs text-or font-medium">En cours</p>
          </div>
          <div className="w-full bg-blanc/10 rounded-full h-1.5">
            <div className="bg-or h-1.5 rounded-full" style={{ width: '20%' }} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Widget Merite ────────────────────────────────────────────────────────────
function WidgetMerite({ gallienId }: { gallienId: string }) {
  const { merite } = useMerite(gallienId)
  const navigate = useNavigate()
  const points = merite?.points_total ?? 0
  const { courant, suivant, progressPct } = getRangSuivant(points)

  return (
    <div
      className="bg-blanc border border-gris rounded-sm p-6 cursor-pointer hover:border-or transition-colors"
      onClick={() => navigate('/merite')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate('/merite')}
      aria-label="Voir mon Merite Gallien"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-or" />
          <p className="font-body text-sm font-semibold text-noir">Merite Gallien</p>
        </div>
        <ChevronRight size={16} className="text-gris-texte" />
      </div>

      <p className="font-display text-4xl font-bold text-or mb-1">
        {points.toLocaleString('fr-FR')}
      </p>
      <p className="font-body text-xs text-gris-texte mb-4">{courant.rang}</p>

      {suivant && (
        <>
          <div className="flex justify-between mb-1">
            <p className="font-body text-xs text-gris-texte">{courant.rang}</p>
            <p className="font-body text-xs text-gris-texte">{suivant.rang}</p>
          </div>
          <div className="w-full bg-gris rounded-full h-1.5">
            <div className="bg-or h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }} />
          </div>
          <p className="font-body text-[11px] text-gris-texte mt-1.5 text-right">
            {(suivant.min - points).toLocaleString('fr-FR')} pts pour {suivant.rang}
          </p>
        </>
      )}

      <p className="font-body text-[10px] text-gris-texte/60 mt-3 italic">
        Ce compteur ne diminue jamais.
      </p>
    </div>
  )
}

// ─── Widget Solde GL ──────────────────────────────────────────────────────────
function WidgetSoldeGL({ gallienId }: { gallienId: string }) {
  const [solde, setSolde] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    supabase
      .from('transactions_gl')
      .select('montant_gl')
      .eq('destinataire_id', gallienId)
      .eq('statut', 'confirme')
      .then(({ data }) => {
        setSolde((data ?? []).reduce((s, t) => s + Number(t.montant_gl), 0))
      })

    supabase
      .from('transactions_gl')
      .select('*')
      .or(`destinataire_id.eq.${gallienId},expediteur_id.eq.${gallienId}`)
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => { if (data) setTransactions(data) })
  }, [gallienId])

  return (
    <div className="bg-blanc border border-gris rounded-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-or" />
        <p className="font-body text-sm font-semibold text-noir">Solde GL</p>
      </div>
      <p className="font-display text-4xl font-bold text-noir mb-1">
        {solde.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
      </p>
      <p className="font-body text-xs text-gris-texte mb-5">GL disponibles</p>

      {transactions.length > 0 && (
        <>
          <GoldRule className="mb-4" />
          <ul className="space-y-2">
            {transactions.map((t) => {
              const isEntree = t.destinataire_id === gallienId
              return (
                <li key={t.id} className="flex items-center justify-between">
                  <p className="font-body text-xs text-gris-texte truncate flex-1 mr-2">
                    {t.description ?? t.type}
                  </p>
                  <p className={`font-body text-xs font-semibold shrink-0 ${isEntree ? 'text-or' : 'text-noir'}`}>
                    {isEntree ? '+' : '-'}{Number(t.montant_gl).toFixed(2)} GL
                  </p>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

// ─── Widget Cercle ────────────────────────────────────────────────────────────
function WidgetCercle({ gallienId, numeroCecg }: { gallienId: string; numeroCecg: string | null }) {
  const { stats } = useReseau(gallienId)
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const lien = numeroCecg ? getLienParrainage(numeroCecg) : ''

  useEffect(() => {
    if (lien) genererQRCode(lien).then(setQrCode)
  }, [lien])

  const handleCopy = async () => {
    if (!lien) return
    const ok = await copierDansPresseP(lien)
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  return (
    <div className="bg-blanc border border-gris rounded-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-or" />
          <p className="font-body text-sm font-semibold text-noir">Mon Cercle</p>
        </div>
        <button onClick={() => navigate('/cercle')}
          className="font-body text-xs text-gris-texte hover:text-noir transition-colors flex items-center gap-1">
          Voir l'arbre <ChevronRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Filleuls N1',  value: stats?.count_n1 ?? 0 },
          { label: 'Total reseau', value: stats?.total_reseau ?? 0 },
          { label: 'GL ce mois',   value: `${(stats?.commissions_mois_gl ?? 0).toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="font-display text-xl font-bold text-noir">{value}</p>
            <p className="font-body text-[10px] text-gris-texte mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <GoldRule className="mb-4" />

      <p className="font-body text-xs font-medium text-noir mb-2">Mon lien de parrainage</p>
      <div className="flex gap-2 mb-3">
        <div className="flex-1 px-3 py-2 bg-gris-clair rounded-sm font-body text-xs text-gris-texte truncate border border-gris">
          {lien || '—'}
        </div>
        <button onClick={handleCopy} disabled={!lien}
          className="flex items-center gap-1.5 px-3 py-2 border border-or rounded-sm font-body text-xs font-medium text-noir hover:bg-or-clair transition-colors shrink-0 disabled:opacity-40">
          {copied ? <Check size={13} className="text-or" /> : <Copy size={13} />}
          {copied ? 'Copie' : 'Copier'}
        </button>
      </div>

      {qrCode && (
        <div className="flex items-center gap-3">
          <img src={qrCode} alt="QR code parrainage" width={56} height={56} className="rounded-sm border border-gris" />
          <p className="font-body text-xs text-gris-texte leading-snug">
            Partage ce QR code pour parrainer de nouveaux Galliens
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Widget Notifications ─────────────────────────────────────────────────────
function WidgetNotifications({ gallienId }: { gallienId: string }) {
  const [notifs, setNotifs] = useState<Notif[]>([])

  const fetchNotifs = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('gallien_id', gallienId)
      .order('created_at', { ascending: false })
      .limit(3)
    if (data) setNotifs(data)
  }, [gallienId])

  useEffect(() => {
    fetchNotifs()
    const channel = supabase
      .channel(`dash-notifs-${gallienId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `gallien_id=eq.${gallienId}` },
        (payload) => setNotifs((prev) => [payload.new as Notif, ...prev].slice(0, 3)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [gallienId, fetchNotifs])

  return (
    <div className="bg-blanc border border-gris rounded-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={16} className="text-or" />
        <p className="font-body text-sm font-semibold text-noir">Notifications</p>
        {notifs.some((n) => !n.lue) && (
          <span className="ml-auto w-2 h-2 rounded-full bg-red-500" />
        )}
      </div>
      {notifs.length === 0 ? (
        <p className="font-body text-sm text-gris-texte text-center py-4">Aucune notification</p>
      ) : (
        <ul className="space-y-3">
          {notifs.map((n) => (
            <li key={n.id} className={`pb-3 border-b border-gris last:border-0 last:pb-0 ${!n.lue ? 'opacity-100' : 'opacity-70'}`}>
              <p className="font-body text-sm font-medium text-noir leading-snug">{n.titre}</p>
              <p className="font-body text-xs text-gris-texte mt-0.5">{n.message}</p>
              <p className="font-body text-[11px] text-gris-texte/60 mt-1">
                {new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { gallien, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const welcome = params.get('welcome') === 'true'

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/')
  }, [loading, isAuthenticated, navigate])

  if (loading) {
    return (
      <PageLayout withSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    )
  }

  if (!gallien) return null

  return (
    <PageLayout withSidebar>
      {welcome && (
        <div className="mb-6 px-5 py-4 bg-or-clair border border-or rounded-sm flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">&#127881;</span>
          <div>
            <p className="font-body text-sm font-semibold text-or-fonce">
              Bienvenue dans la communaute Gallienne, {gallien.prenom} !
            </p>
            <p className="font-body text-xs text-or-fonce/70 mt-0.5">
              Ta Carte Civile Gallienne va etre envoyee par email dans quelques instants.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <WidgetIdentite />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <WidgetMerite gallienId={gallien.id} />
          <WidgetSoldeGL gallienId={gallien.id} />
        </div>
        <WidgetCercle gallienId={gallien.id} numeroCecg={gallien.numero_cecg} />
        <WidgetNotifications gallienId={gallien.id} />
      </div>
    </PageLayout>
  )
}
