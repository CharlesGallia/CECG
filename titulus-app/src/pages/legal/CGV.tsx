import LegalLayout from '../../components/LegalLayout'

export default function CGV() {
  return (
    <LegalLayout title="Conditions Générales de Vente / Utilisation">
      <p>
        Les présentes CGV régissent la souscription à la <em>Titulus Civilis</em> proposée par l'Association GIFTER.
      </p>

      <h2 className="titre-or text-base mt-6">Article 1 — Objet</h2>
      <p>
        La cotisation fondatrice de <strong>77 € (paiement annuel unique)</strong>, soit l'équivalent de 6,42 €/mois,
        donne droit à l'émission de la Titulus Civilis, à l'inscription au registre des Galliens primo-déclarés,
        au rang d'Aspirant Gallien et à l'accès prioritaire à la Gallibra.
      </p>

      <h2 className="titre-or text-base mt-6">Article 2 — Paiement</h2>
      <p>
        Le règlement s'effectue via Stripe Checkout en mode paiement unique. Aucun renouvellement automatique n'est appliqué.
      </p>

      <h2 className="titre-or text-base mt-6">Article 3 — Droit de rétractation</h2>
      <p>
        Conformément à l'article L221-18 du Code de la consommation, le déclarant dispose d'un délai de 14 jours pour exercer
        son droit de rétractation. En cochant la case dédiée à l'étape II du funnel, le déclarant demande l'émission immédiate
        de sa Titulus Civilis dès validation du KYC, et reconnaît que <strong>ce droit sera perdu pour la part du service exécutée</strong>{' '}
        (art. L221-25). Le remboursement reste possible au prorata avant émission.
      </p>

      <h2 className="titre-or text-base mt-6">Article 4 — Émission et livraison</h2>
      <p>
        La Titulus Civilis est émise sous <strong>21 jours</strong> après validation KYC, et expédiée à l'adresse renseignée
        à l'étape III. La validation KYC intervient sous 48 h après transmission des pièces.
      </p>

      <h2 className="titre-or text-base mt-6">Article 5 — Conditions d'éligibilité</h2>
      <p>Le souscripteur doit être majeur (18 ans révolus) et capable juridiquement.</p>

      <h2 className="titre-or text-base mt-6">Article 6 — Litiges</h2>
      <p>
        En cas de litige, une solution amiable sera recherchée. À défaut, les tribunaux français seront compétents,
        sous réserve des règles de compétence d'ordre public.
      </p>
    </LegalLayout>
  )
}
