import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import HelloAssoWidget from '../components/HelloAssoWidget'
import GoldRule from '../components/GoldRule'

export default function PaiementPage() {
  const navigate = useNavigate()
  const { user, refreshGallien } = useAuth()

  const handleSuccess = useCallback(async () => {
    if (!user) return

    try {
      // 1. Mettre à jour le statut CECG
      await supabase
        .from('galliens')
        .update({
          cecg_statut: 'definitive',
          cecg_chemin: 'standard',
          cecg_date: new Date().toISOString(),
        })
        .eq('id', user.id)

      // 2. Générer le numéro CECG
      await supabase.rpc('generer_numero_cecg', { gallien_id: user.id })

      // 3. Envoyer la CECG par email
      await supabase.functions.invoke('envoyer-cecg', {
        body: { gallienId: user.id },
      })

      refreshGallien()
      navigate('/dashboard?welcome=true')
    } catch (err) {
      console.error('Erreur post-paiement:', err)
      // Même en cas d'erreur JS, le webhook plan B prend le relais
      navigate('/dashboard?welcome=true')
    }
  }, [user, navigate, refreshGallien])

  const handleCancel = useCallback(() => {
    navigate('/cecg?annule=true')
  }, [navigate])

  return (
    <div className="min-h-screen bg-blanc">
      {/* Header */}
      <section className="pt-12 pb-8 px-4 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/cecg')}
          className="flex items-center gap-2 font-body text-sm text-gris-texte hover:text-noir transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Retour au choix
        </button>

        <p className="font-body text-xs tracking-[0.3em] uppercase text-or mb-3">
          Adhésion Gallia
        </p>
        <h1 className="font-display text-4xl font-bold text-noir mb-3">
          Paiement 77 GL
        </h1>
        <GoldRule width="60px" thickness={2} className="mb-5" />
        <p className="font-body text-sm text-gris-texte leading-relaxed">
          Ton adhésion est traitée de manière sécurisée via HelloAsso,
          association de confiance spécialisée dans les paiements associatifs.
        </p>
      </section>

      {/* Garanties */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="flex items-center gap-3 px-4 py-3 bg-or-clair border border-or rounded-sm">
          <Shield size={18} className="text-or shrink-0" />
          <p className="font-body text-xs text-or-fonce leading-snug">
            Paiement 100 % sécurisé · Aucune donnée bancaire stockée par Gallia ·
            Reçu fiscal envoyé automatiquement par HelloAsso
          </p>
        </div>
      </div>

      {/* iFrame HelloAsso */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <HelloAssoWidget onSuccess={handleSuccess} onCancel={handleCancel} />

        <p className="mt-6 text-center font-body text-xs text-gris-texte leading-relaxed">
          En cas de problème, ton paiement est également vérifié côté serveur.
          Tu recevras ta CECG par email dans les minutes suivant la confirmation.
        </p>
      </section>
    </div>
  )
}
