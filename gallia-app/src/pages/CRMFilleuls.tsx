import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Clock, ChevronRight, Send, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import PageLayout from '../components/PageLayout'
import Badge from '../components/Badge'
import GoldRule from '../components/GoldRule'

type Filtre = 'tous' | 'definitifs' | 'provisoires'

interface FilleulRow {
  id: string
  prenom: string
  nom: string
  numero_cecg: string | null
  cecg_statut: string
  rang: string
  created_at: string
  commissions_gl: number
  merite_genere: number
  count_filleuls_n2: number
  jours_depuis_inscription: number
}

export default function CRMFilleuls() {
  const { gallien, loading, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [filleuls, setFilleuls] = useState<FilleulRow[]>([])
  const [fetching, setFetching] = useState(true)
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const [relancen, setRelancen] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/')
  }, [loading, isAuthenticated, navigate])

  const fetchFilleuls = useCallback(async () => {
    if (!gallien) return
    setFetching(true)

    // Filleuls N1
    const { data: f } = await supabase
      .from('galliens')
      .select('id, prenom, nom, numero_cecg, cecg_statut, rang, created_at')
      .eq('parrain_id', gallien.id)
      .order('created_at', { ascending: false })

    if (!f) { setFetching(false); return }

    // Pour chaque filleul : commissions GL generees + count de leurs propres filleuls
    const enriched = await Promise.all(
      f.map(async (fil) => {
        const [commRes, n2Res] = await Promise.all([
          supabase
            .from('transactions_gl')
            .select('montant_gl, merite_genere')
            .eq('expediteur_id', fil.id)
            .eq('destinataire_id', gallien.id)
            .eq('statut', 'confirme'),
          supabase
            .from('galliens')
            .select('id', { count: 'exact', head: true })
            .eq('parrain_id', fil.id),
        ])

        const commissions_gl = (commRes.data ?? []).reduce((s, t) => s + Number(t.montant_gl), 0)
        const merite_genere = (commRes.data ?? []).reduce((s, t) => s + (t.merite_genere ?? 0), 0)
        const count_filleuls_n2 = n2Res.count ?? 0
        const jours = Math.floor((Date.now() - new Date(fil.created_at).getTime()) / 86400000)

        return {
          ...fil,
          commissions_gl,
          merite_genere,
          count_filleuls_n2,
          jours_depuis_inscription: jours,
        } as FilleulRow
      })
    )

    setFilleuls(enriched)
    setFetching(false)
  }, [gallien])

  useEffect(() => {
    fetchFilleuls()
  }, [fetchFilleuls])

  const handleRelancer = async (filleulId: string, _email: string) => {
    setRelancen((prev) => new Set(prev).add(filleulId))
    await supabase.functions.invoke('relancer-filleul', {
      body: { filleulId, parrainPrenom: gallien?.prenom },
    })
    setTimeout(() => {
      setRelancen((prev) => { const s = new Set(prev); s.delete(filleulId); return s })
    }, 3000)
  }

  const filleulsFiltres = filleuls.filter((f) => {
    if (filtre === 'definitifs') return f.cecg_statut === 'definitive'
    if (filtre === 'provisoires') return f.cecg_statut !== 'definitive'
    return true
  })

  const stats = {
    total: filleuls.length,
    definitifs: filleuls.filter((f) => f.cecg_statut === 'definitive').length,
    provisoires: filleuls.filter((f) => f.cecg_statut !== 'definitive').length,
    glTotal: filleuls.reduce((s, f) => s + f.commissions_gl, 0),
  }

  const FILTRES: { id: Filtre; label: string; count: number }[] = [
    { id: 'tous',       label: 'Tous',       count: stats.total },
    { id: 'definitifs', label: 'Definitifs', count: stats.definitifs },
    { id: 'provisoires',label: 'Provisoires',count: stats.provisoires },
  ]

  return (
    <PageLayout withSidebar>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-noir mb-1">Mes Filleuls</h1>
        <p className="font-body text-sm text-gris-texte">Niveau 1 — tes parrainages directs</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total filleuls', value: stats.total },
          { label: 'Definitifs',     value: stats.definitifs },
          { label: 'Provisoires',    value: stats.provisoires },
          { label: 'GL generes',     value: `${stats.glTotal.toFixed(2)} GL` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-blanc border border-gris rounded-sm p-4 text-center">
            <p className="font-display text-xl font-bold text-noir">{value}</p>
            <p className="font-body text-xs text-gris-texte mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-5">
        {FILTRES.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFiltre(id)}
            className={`px-4 py-2 rounded-sm font-body text-sm font-medium border transition-colors ${
              filtre === id
                ? 'bg-noir text-blanc border-noir'
                : 'bg-blanc text-gris-texte border-gris hover:border-or hover:text-noir'
            }`}
          >
            {label}
            <span className={`ml-2 text-xs ${filtre === id ? 'text-blanc/70' : 'text-gris-texte'}`}>
              {count}
            </span>
          </button>
        ))}
        <button
          onClick={fetchFilleuls}
          className="ml-auto p-2 text-gris-texte hover:text-noir transition-colors"
          aria-label="Rafraichir"
        >
          <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Liste */}
      {fetching ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filleulsFiltres.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <Users size={32} className="text-gris-texte" />
          <p className="font-body text-sm text-gris-texte">
            {filtre === 'tous' ? 'Aucun filleul pour le moment.' : `Aucun filleul ${filtre}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filleulsFiltres.map((f) => {
            const peutRelancer = f.cecg_statut !== 'definitive' && f.jours_depuis_inscription > 30
            const enRelance = relancen.has(f.id)

            return (
              <div key={f.id} className="bg-blanc border border-gris rounded-sm p-4 hover:border-or transition-colors">
                <div className="flex items-start justify-between gap-3">
                  {/* Identite */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-or-clair border border-or flex items-center justify-center shrink-0">
                      <span className="font-display text-base font-bold text-or-fonce">
                        {f.prenom[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold text-noir truncate">
                        {f.prenom} {f.nom}
                      </p>
                      <p className="font-body text-xs text-gris-texte tracking-wider">
                        {f.numero_cecg ?? 'Sans numero'}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge type="statut-cecg">{f.cecg_statut}</Badge>
                    {peutRelancer && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} className="text-amber-500" />
                        <span className="font-body text-[10px] text-amber-600">
                          {f.jours_depuis_inscription}j
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <GoldRule className="my-3" />

                {/* Stats filleul */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: 'GL generes',    value: `${f.commissions_gl.toFixed(2)} GL` },
                    { label: 'Merite apporte',value: `${f.merite_genere} pts` },
                    { label: 'Ses filleuls',  value: f.count_filleuls_n2 },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="font-display text-base font-bold text-noir">{value}</p>
                      <p className="font-body text-[10px] text-gris-texte">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <p className="font-body text-[11px] text-gris-texte">
                    Inscrit le {new Date(f.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {peutRelancer && (
                    <button
                      onClick={() => handleRelancer(f.id, '')}
                      disabled={enRelance}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-or rounded-sm font-body text-xs font-medium text-noir hover:bg-or-clair transition-colors disabled:opacity-50"
                    >
                      {enRelance
                        ? <><RefreshCw size={12} className="animate-spin" /> Envoye</>
                        : <><Send size={12} /> Relancer</>
                      }
                    </button>
                  )}
                  <ChevronRight size={14} className="text-gris-texte ml-auto" />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageLayout>
  )
}
