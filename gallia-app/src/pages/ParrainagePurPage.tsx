import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/Button'
import GoldRule from '../components/GoldRule'
import { getLienParrainage, genererQRCode, copierDansPresseP } from '../utils/parrainage'

export default function ParrainagePurPage() {
  const navigate = useNavigate()
  const { user, gallien, refreshGallien } = useAuth()

  const [initializing, setInitializing] = useState(false)
  const [parrainagesCount, setParrainagesCount] = useState(0)
  const [qrCode, setQrCode] = useState('')
  const [copied, setCopied] = useState(false)

  const lienParrainage = gallien?.numero_cecg
    ? getLienParrainage(gallien.numero_cecg)
    : ''

  // Activer le chemin parrainage si pas encore fait
  const activerParrainage = useCallback(async () => {
    if (!user || gallien?.cecg_statut === 'provisoire_parrainage') return
    setInitializing(true)
    try {
      // Générer un numéro CECG provisoire si pas encore
      if (!gallien?.numero_cecg) {
        await supabase.rpc('generer_numero_cecg', { gallien_id: user.id })
      }

      await supabase
        .from('galliens')
        .update({
          cecg_statut: 'provisoire_parrainage',
          cecg_chemin: 'parrainage',
          cecg_date: new Date().toISOString(),
        })
        .eq('id', user.id)

      refreshGallien()
    } finally {
      setInitializing(false)
    }
  }, [user, gallien, refreshGallien])

  useEffect(() => {
    activerParrainage()
  }, [activerParrainage])

  // Charger QR + compteur
  useEffect(() => {
    if (!lienParrainage) return
    genererQRCode(lienParrainage).then(setQrCode)
  }, [lienParrainage])

  useEffect(() => {
    if (!user) return
    // Écouter les nouveaux filleuls en temps réel
    const channel = supabase
      .channel(`filleuls-parrainage-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'galliens',
          filter: `parrain_id=eq.${user.id}`,
        },
        () => setParrainagesCount((n) => n + 1)
      )
      .subscribe()

    // Compter les filleuls qui ont payé (cecg_statut = definitive)
    supabase
      .from('galliens')
      .select('id', { count: 'exact' })
      .eq('parrain_id', user.id)
      .eq('cecg_statut', 'definitive')
      .then(({ count }) => setParrainagesCount(count ?? 0))

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const handleCopy = async () => {
    const ok = await copierDansPresseP(lienParrainage)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const progressPct = Math.min((parrainagesCount / 5) * 100, 100)

  return (
    <div className="min-h-screen bg-blanc">
      {/* Header */}
      <section className="pt-12 pb-8 px-4 max-w-xl mx-auto">
        <button
          onClick={() => navigate('/cecg')}
          className="flex items-center gap-2 font-body text-sm text-gris-texte hover:text-noir transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <p className="font-body text-xs tracking-[0.3em] uppercase text-or mb-3">
          Chemin Parrainage
        </p>
        <h1 className="font-display text-4xl font-bold text-noir mb-3">
          Carte par le Parrainage
        </h1>
        <GoldRule width="60px" thickness={2} className="mb-5" />
        <p className="font-body text-sm text-gris-texte leading-relaxed">
          Parraine 5 Galliens qui adhèrent à 77 GL et ta carte devient définitive — sans débourser un seul GL.
        </p>
      </section>

      <section className="max-w-xl mx-auto px-4 pb-20 space-y-8">

        {/* Progression */}
        <div className="border border-gris rounded-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-or" />
              <p className="font-body text-sm font-semibold text-noir">Parrainages validés</p>
            </div>
            <p className="font-display text-xl font-bold text-or">
              {parrainagesCount}<span className="text-gris-texte font-body text-sm font-normal">/5</span>
            </p>
          </div>

          {/* Barre progression avec jalons */}
          <div className="relative mb-3">
            <div className="w-full bg-gris rounded-full h-3">
              <div
                className="bg-or h-3 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {/* Points de jalon */}
            <div className="flex justify-between mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                    n <= parrainagesCount
                      ? 'bg-or border-or'
                      : 'bg-blanc border-gris'
                  }`} />
                  <span className="font-body text-[10px] text-gris-texte mt-1">{n}</span>
                </div>
              ))}
            </div>
          </div>

          {parrainagesCount >= 5 ? (
            <p className="font-body text-sm font-semibold text-or text-center">
              Objectif atteint ! Ta carte va devenir définitive.
            </p>
          ) : (
            <p className="font-body text-xs text-gris-texte text-center">
              {5 - parrainagesCount} parrainage{5 - parrainagesCount > 1 ? 's' : ''} restant{5 - parrainagesCount > 1 ? 's' : ''} pour obtenir ta carte définitive
            </p>
          )}
        </div>

        <GoldRule />

        {/* Lien de parrainage */}
        <div>
          <p className="font-body text-sm font-semibold text-noir mb-3">
            Mon lien de parrainage unique
          </p>

          {initializing || !lienParrainage ? (
            <div className="h-12 bg-gris-clair rounded-sm animate-pulse" />
          ) : (
            <>
              <div className="flex gap-2 mb-5">
                <div className="flex-1 px-3 py-2.5 bg-gris-clair rounded-sm font-body text-xs text-gris-texte truncate border border-gris select-all">
                  {lienParrainage}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-or rounded-sm font-body text-sm font-medium text-noir hover:bg-or-clair transition-colors shrink-0"
                >
                  {copied
                    ? <><Check size={14} className="text-or" /> Copié</>
                    : <><Copy size={14} /> Copier</>
                  }
                </button>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="flex flex-col items-center gap-3 p-5 border border-gris rounded-sm bg-blanc">
                  <img
                    src={qrCode}
                    alt="QR code mon lien de parrainage"
                    width={180}
                    height={180}
                    className="rounded-sm"
                  />
                  <p className="font-body text-xs text-gris-texte text-center">
                    Partage ce QR code en personne ou sur les réseaux
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Note sur les droits limités */}
        <div
          className="px-4 py-3 font-body text-xs text-gris-texte leading-relaxed"
          style={{ background: '#FAF8F5', borderLeft: '2px solid #B8960C' }}
        >
          En carte provisoire parrainage, tu as accès à ton tableau de bord de parrainage.
          L'accès complet (Cercle, Mérite, commissions) s'active à la validation de ta carte définitive.
        </div>

        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={() => navigate('/dashboard')}
        >
          Voir mon tableau de bord
        </Button>
      </section>
    </div>
  )
}
