import LegalLayout from '../../components/LegalLayout'

export default function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>
        L'Association GIFTER (SIREN 533 624 649), responsable de traitement, met en œuvre des traitements de données à caractère
        personnel dans le cadre exclusif de la souscription à la <em>Titulus Civilis</em>, conformément au Règlement Général sur la
        Protection des Données (RGPD, UE 2016/679) et à la loi Informatique et Libertés.
      </p>

      <h2 className="titre-or text-base mt-6">Données collectées</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Identité (prénom, nom, nom gallien optionnel, date et lieu de naissance, nationalité civile)</li>
        <li>Coordonnées (adresse postale, e-mail, téléphone)</li>
        <li>Pièces KYC (CNI/passeport recto, selfie, preuve de vie datée)</li>
        <li>Signature manuscrite, IP de signature, hash du PDF généré</li>
      </ul>

      <h2 className="titre-or text-base mt-6">Finalités</h2>
      <p>
        Émission de la Titulus Civilis · inscription au registre des Galliens primo-déclarés · vérification de titularité ·
        envoi des e-mails transactionnels · preuve d'engagement.
      </p>

      <h2 className="titre-or text-base mt-6">⚠ Purge automatique des pièces KYC sous 48 h</h2>
      <p>
        Conformément au principe de minimisation (art. 5.1.c RGPD), les pièces d'identité (recto, selfie, preuve de vie) sont
        <strong> purgées automatiquement sous 48 h</strong> après leur vérification. Aucune copie n'est archivée par GIFTER ni par le Consulat de Gallia.
        Seuls le statut (validé / refusé) et un hash anonymisé sont conservés à des fins de traçabilité.
      </p>

      <h2 className="titre-or text-base mt-6">Durées de conservation</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>État civil et coordonnées : durée de l'adhésion + 3 ans (preuve d'engagement)</li>
        <li>Pièces KYC : ≤ 48 h après vérification</li>
        <li>Adresse IP de signature : ≤ 12 mois</li>
        <li>PDF Declaratio signé : durée de l'adhésion + 10 ans (valeur de preuve)</li>
      </ul>

      <h2 className="titre-or text-base mt-6">Vos droits</h2>
      <p>
        Droit d'accès, de rectification, d'effacement, de portabilité, de limitation et d'opposition. Pour exercer ces droits,
        contactez-nous via la <a href="/contact" className="text-or hover:underline">page Contact</a>.
      </p>

      <h2 className="titre-or text-base mt-6">Cookies</h2>
      <p>
        Seuls les cookies strictement nécessaires au fonctionnement du funnel sont déposés (session déclarant). Le widget hCaptcha
        utilise ses propres cookies à des fins anti-bot (voir <a href="https://www.hcaptcha.com/privacy" className="text-or hover:underline" target="_blank" rel="noreferrer">politique hCaptcha</a>).
      </p>
    </LegalLayout>
  )
}
