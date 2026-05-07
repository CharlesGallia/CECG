import LegalLayout from '../../components/LegalLayout'

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales">
      <h2 className="titre-or text-base">Éditeur du site</h2>
      <p>
        Le site <strong>titulus.gallia.space</strong> est édité par l'<strong>Association GIFTER</strong>,
        association loi 1901, identifiée par le SIREN <strong>533 624 649</strong>,
        dont le siège social est sis 8 Route du Minerai, Menestreau.
      </p>
      <p>
        <strong>Directeur de publication</strong> : Charles POURLIER, Premier Consul de l'Imperio Gallorum Sociatis.
      </p>

      <h2 className="titre-or text-base mt-6">Hébergement</h2>
      <p>
        Hostinger International Ltd, 61 Lordou Vironos Street, 6023 Larnaca, Chypre.
      </p>

      <h2 className="titre-or text-base mt-6">Contact</h2>
      <p>
        Voir la <a href="/contact" className="text-or hover:underline">page Contact</a>.
      </p>

      <h2 className="titre-or text-base mt-6">Propriété intellectuelle</h2>
      <p>
        L'ensemble des contenus (textes, marques, blasons, sceaux, polices, gabarits Declaratio Galliæ) est la propriété
        exclusive de l'<em>Imperio Gallorum Sociatis</em>, du Consulat de Gallia ou de l'Association GIFTER. Toute reproduction,
        même partielle, est soumise à autorisation préalable.
      </p>
    </LegalLayout>
  )
}
