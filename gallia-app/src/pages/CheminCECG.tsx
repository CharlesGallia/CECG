import { useNavigate } from 'react-router-dom'
import { Check, Upload, Users } from 'lucide-react'
import Button from '../components/Button'
import GoldRule from '../components/GoldRule'

interface CheminCardProps {
  title: string
  subtitle: string
  price: string
  priceDetail: string
  statut: string
  features: string[]
  cta: string
  variant: 'primary' | 'secondary'
  highlighted?: boolean
  onClick: () => void
  icon: React.ReactNode
}

function CheminCard({
  title, subtitle, price, priceDetail, statut,
  features, cta, variant, highlighted = false, onClick, icon,
}: CheminCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-sm bg-blanc p-6 ${
        highlighted
          ? 'border-[1.5px] border-or shadow-[0_4px_24px_rgba(184,150,12,0.15)]'
          : 'border border-gris shadow-sm'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-or text-blanc text-[10px] font-body font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Recommandé
          </span>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-or-clair border border-or flex items-center justify-center shrink-0 text-or">
          {icon}
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold text-noir leading-tight">{title}</h3>
          <p className="font-body text-xs text-gris-texte">{subtitle}</p>
        </div>
      </div>

      <GoldRule className="mb-4" />

      {/* Prix */}
      <div className="mb-5">
        <span className="font-display text-3xl font-bold text-noir">{price}</span>
        <span className="font-body text-sm text-gris-texte ml-2">{priceDetail}</span>
        <p className="font-body text-xs text-or-fonce font-medium mt-1 uppercase tracking-wide">
          {statut}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check size={14} className="text-or shrink-0 mt-0.5" aria-hidden="true" />
            <span className="font-body text-sm text-noir leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      <Button variant={variant} size="md" className="w-full" onClick={onClick}>
        {cta}
      </Button>
    </div>
  )
}

export default function CheminCECG() {
  const navigate = useNavigate()

  const chemins: CheminCardProps[] = [
    {
      title: 'Standard',
      subtitle: 'Adhésion complète',
      price: '77 GL',
      priceDetail: 'paiement unique',
      statut: 'Carte Définitive',
      highlighted: true,
      icon: <Check size={18} />,
      features: [
        'Paiement immédiat par HelloAsso',
        'Carte Civile Gallienne définitive',
        'Accès complet à tous les services',
        'Commissions de parrainage actives',
        'Mérite Gallien complet',
      ],
      cta: 'Obtenir ma CECG',
      variant: 'primary',
      onClick: () => navigate('/cecg/paiement'),
    },
    {
      title: 'Solidaire',
      subtitle: 'RSA · Chômage · Étudiant',
      price: 'Gratuit',
      priceDetail: 'provisoire 6 mois',
      statut: 'Carte Provisoire',
      icon: <Users size={18} />,
      features: [
        'Justificatif de situation requis',
        'Carte provisoire valable 6 mois',
        '5 parrainages = carte définitive',
        'Accès aux services essentiels',
        'Mérite Gallien actif',
      ],
      cta: 'Charger mon justificatif',
      variant: 'secondary',
      onClick: () => navigate('/cecg/solidaire'),
    },
    {
      title: 'Par le Parrainage',
      subtitle: 'Gratuit · Accès progressif',
      price: 'Gratuit',
      priceDetail: '5 parrainages requis',
      statut: 'Carte Provisoire',
      icon: <Upload size={18} />,
      features: [
        'Zéro avance de fonds',
        'Carte provisoire immédiate',
        '5 Galliens à 77 GL = carte définitive',
        'Lien de parrainage unique fourni',
        'Dashboard parrainage dédié',
      ],
      cta: 'Démarrer par le parrainage',
      variant: 'secondary',
      onClick: () => navigate('/cecg/parrainage'),
    },
  ]

  return (
    <div className="min-h-screen bg-blanc">
      {/* Header */}
      <section className="pt-16 pb-10 px-4 text-center max-w-2xl mx-auto">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-or mb-5">
          Ton Acte de Renaissance est confirmé
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-noir leading-tight mb-4">
          Choisis ton chemin
        </h1>
        <GoldRule width="60px" thickness={2} centered className="mb-5" />
        <p className="font-body text-base text-gris-texte leading-relaxed">
          Obtiens ta Carte Civile Gallienne selon ta situation.
          Tous les chemins mènent à la même communauté.
        </p>
      </section>

      {/* Cards */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {chemins.map((c) => (
            <CheminCard key={c.title} {...c} />
          ))}
        </div>

        {/* Note bas de page */}
        <div className="mt-10 text-center">
          <p className="font-body text-xs text-gris-texte leading-relaxed max-w-lg mx-auto">
            Quel que soit le chemin choisi, ton Mérite Gallien commence à s'accumuler dès aujourd'hui.
            La carte provisoire offre accès à l'essentiel des services de la communauté.
          </p>
        </div>
      </section>
    </div>
  )
}
