/**
 * Page publique partageable d'un Gallien.
 * Partage WhatsApp / Telegram / reseaux sociaux.
 * Affiche : Prenom · Rang Merite · Badge CECG active
 * N'affiche JAMAIS le nom complet ni donnees sensibles.
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'
import GoldRule from '../components/GoldRule'
import Badge from '../components/Badge'

interface GallienPublic {
  prenom: string
  numero_cecg: string
  rang: string
  cecg_statut: string
  created_at: string
}

export default function PagePubliqueGallien() {
  const { numero } = useParams<{ numero: string }>()
  const navigate = useNavigate()
  const [gallien, setGallien] = useState<GallienPublic | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!numero) return

    // Mettre a jour les meta OG dynamiquement
    const updateMeta = (prenom: string, rang: string) => {
      document.title = `${prenom} — Gallien ${rang} | IGS`

      const setMeta = (prop: string, content: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el) }
        el.content = content
      }
      setMeta('og:title', `${prenom} vous invite a rejoindre Gallia`)
      setMeta('og:description', `${prenom} est ${rang} dans la communaute Gallienne souveraine. Rejoignez-nous.`)
      setMeta('og:url', window.location.href)
      setMeta('og:type', 'profile')
    }

    supabase
      .from('galliens')
      .select('prenom, numero_cecg, rang, cecg_statut, created_at')
      .eq('numero_cecg', numero)
      .single()
      .then(({ data }) => {
        if (data) {
          setGallien(data as GallienPublic)
          updateMeta(data.prenom, data.rang)
        }
        setLoading(false)
      })
  }, [numero])

  const lienInscription = gallien
    ? `${window.location.origin}/?ref=${gallien.numero_cecg}`
    : window.location.origin

  if (loading) {
    return (
      <div className="min-h-screen bg-blanc flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!gallien) {
    return (
      <div className="min-h-screen bg-blanc flex flex-col items-center justify-center px-4 gap-4">
        <p className="font-display text-xl text-noir">Gallien introuvable</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/')}>
          Rejoindre Gallia
        </Button>
      </div>
    )
  }

  const initial = gallien.prenom[0].toUpperCase()
  const isActive = gallien.cecg_statut === 'definitive'

  return (
    <div className="min-h-screen bg-blanc flex flex-col items-center justify-center px-4 py-16">
      {/* Meta OG sont gerees dynamiquement dans useEffect */}

      <div className="w-full max-w-sm text-center">
        {/* Logo IGS */}
        <p className="font-body text-xs tracking-[0.3em] uppercase text-or mb-8">
          Imperio Gallorum Sociatis
        </p>

        {/* Avatar */}
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-5 ${
          isActive
            ? 'bg-or-clair border-2 border-or'
            : 'bg-gris-clair border-2 border-gris'
        }`}>
          <span className="font-display text-4xl font-bold text-or-fonce">{initial}</span>
        </div>

        {/* Prenom */}
        <h1 className="font-display text-4xl font-bold text-noir mb-2">
          {gallien.prenom}
        </h1>

        <GoldRule width="48px" thickness={2} centered className="mb-4" />

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Badge type="rang-merite">{gallien.rang}</Badge>
          {isActive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-body font-semibold bg-or text-blanc border border-or uppercase tracking-wider">
              CECG Active
            </span>
          )}
        </div>

        {/* Message */}
        <div
          className="px-5 py-4 mb-8 text-sm font-body text-noir leading-relaxed"
          style={{ background: '#FAF8F5', borderLeft: '2px solid #B8960C' }}
        >
          <strong>{gallien.prenom}</strong> te parraine pour rejoindre la communaute Gallienne.
          Gallia est une communaute souveraine internationale fondee sur la dignite, la fraternite
          et la responsabilite.
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          className="w-full mb-4"
          onClick={() => navigate(`/?ref=${gallien.numero_cecg}`)}
        >
          <Users size={16} className="mr-2" />
          Rejoindre Gallia via {gallien.prenom}
        </Button>

        <p className="font-body text-xs text-gris-texte leading-relaxed">
          En cliquant, {gallien.prenom} sera enregistre(e) comme ton parrain.
          L'adhesion standard est de 77 GL.
        </p>

        {/* Lien de partage */}
        <div className="mt-8 pt-6 border-t border-gris">
          <p className="font-body text-xs text-gris-texte mb-3">Partager cette page</p>
          <div className="flex justify-center gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Rejoins Gallia via mon parrainage : ${lienInscription}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] text-blanc font-body text-xs font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              WhatsApp
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(lienInscription)}&text=${encodeURIComponent(`Rejoins Gallia via ${gallien.prenom}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#0088cc] text-blanc font-body text-xs font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              Telegram
            </a>
          </div>
        </div>

        <p className="font-display text-xs text-gris-texte italic mt-8">
          Soveregnitas non negotiatur. Exercetur.
        </p>
      </div>
    </div>
  )
}
