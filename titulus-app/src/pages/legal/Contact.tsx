import LegalLayout from '../../components/LegalLayout'

export default function Contact() {
  return (
    <LegalLayout title="Contact">
      <p>Pour toute question relative à votre souscription, à vos données personnelles ou à l'exercice de vos droits RGPD :</p>

      <div className="imperial-card mt-4">
        <h2 className="titre-or text-sm mb-3">Association GIFTER</h2>
        <p className="font-sans text-sm">
          8 Route du Minerai<br />
          Menestreau<br />
          SIREN 533 624 649
        </p>
      </div>

      <p className="mt-6">
        Vous pouvez également nous écrire à l'adresse e-mail figurant sur votre confirmation de souscription.
      </p>

      <h2 className="titre-or text-base mt-6">DPO (Délégué à la Protection des Données)</h2>
      <p>
        Le DPO de référence est désigné par l'Association GIFTER. Toute demande relative au RGPD peut lui être adressée
        à l'adresse postale ci-dessus, sous l'objet <em>« RGPD — Titulus Civilis »</em>.
      </p>
    </LegalLayout>
  )
}
