import { CheckCircle, Mail } from 'lucide-react'
import GoldRule from '../components/GoldRule'

export default function MerciPage() {
  return (
    <div className="min-h-screen bg-blanc flex flex-col items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-or-clair border border-or flex items-center justify-center">
            <CheckCircle size={32} className="text-or" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="font-display text-4xl font-bold text-noir mb-4">
          Serment prononcé
        </h1>
        <GoldRule width="60px" thickness={2} centered className="mb-6" />

        {/* Message principal */}
        <p className="font-body text-base text-noir leading-relaxed mb-3">
          Bienvenue dans la communauté Gallienne.
        </p>
        <p className="font-body text-sm text-gris-texte leading-relaxed mb-8">
          Un email t'a été envoyé avec ton Acte de Renaissance et un lien pour obtenir ta Carte Civile Gallienne.
          Ce lien est valable <strong>3 mois</strong>.
        </p>

        {/* Encart email */}
        <div
          className="flex items-start gap-3 rounded-sm px-5 py-4 mb-8 text-left"
          style={{ background: '#FAF8F5', borderLeft: '2px solid #B8960C' }}
        >
          <Mail size={18} className="text-or shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-sm font-semibold text-noir mb-1">Vérifie ta boîte mail</p>
            <p className="font-body text-xs text-gris-texte leading-relaxed">
              Si tu ne vois pas l'email dans les prochaines minutes, consulte ton dossier spam ou courrier indésirable.
            </p>
          </div>
        </div>

        {/* Devise */}
        <p className="font-display text-sm text-gris-texte italic">
          Soveregnitas non negotiatur. Exercetur.
        </p>
        <p className="font-body text-xs text-gris-texte/60 mt-2 tracking-widest uppercase">
          Imperio Gallorum Sociatis
        </p>
      </div>
    </div>
  )
}
