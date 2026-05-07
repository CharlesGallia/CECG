/**
 * ÉTAPE VI — CONFIRMATIO (Remerciement)
 * Route : /confirmation
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import FunnelLayout from '../components/FunnelLayout'
import SectionTitle from '../components/SectionTitle'
import BlasonCouronne from '../assets/BlasonCouronne'
import TitulusCardMock from '../assets/TitulusCardMock'
import DeclaratioPdf from '../pdf/DeclaratioPdf'
import { useFunnel } from '../lib/funnelContextValue'

export default function ConfirmationPage() {
  const navigate = useNavigate()
  const { session, reset } = useFunnel()
  const [downloading, setDownloading] = useState(false)

  // Garde de route
  useEffect(() => {
    if (!session.kycTransmis) navigate('/kyc', { replace: true })
  }, [session.kycTransmis, navigate])

  const dateEnreg = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  async function reDownloadPdf() {
    if (!session.declaratio || !session.numeroDeclaratio) return
    setDownloading(true)
    try {
      const blob = await pdf(
        <DeclaratioPdf
          data={session.declaratio}
          numero={session.numeroDeclaratio}
          signatureDataUrl={session.signatureDataUrl}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Declaratio-${session.numeroDeclaratio}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } finally {
      setDownloading(false)
    }
  }

  if (!session.kycTransmis) return null

  return (
    <FunnelLayout step="confirmation">
      {/* Hero confirmation */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4 relative">
          <div aria-hidden className="absolute inset-0 bg-or/15 rounded-full blur-3xl animate-pulse-or" />
          <BlasonCouronne size={220} className="relative" />
        </div>

        <SectionTitle
          surtitre="Étape VI · Confirmatio"
          titre={<>Salve, <span className="italic text-or">Cive Gallice</span>.</>}
          soustitre="Votre déclaration est enregistrée. Vous êtes inscrit au registre des Galliens primo-déclarés."
        />
      </div>

      {/* Carte Titulus en preview */}
      <div className="flex justify-center mb-12">
        <div className="relative">
          <TitulusCardMock prenom={session.identite?.prenom ?? ''} nom={session.identite?.nom ?? ''} />
          <div className="absolute -top-3 -right-3 bg-or text-noir px-3 py-1 font-cinzel text-xs tracking-imperial rounded-sm shadow-or-strong">
            ⚜ EN ÉMISSION
          </div>
        </div>
      </div>

      {/* Bloc récapitulatif */}
      <div className="imperial-card max-w-2xl mx-auto mb-10" style={{ borderColor: 'rgba(232,217,168,0.5)' }}>
        <h3 className="titre-or text-sm mb-4 flex items-center gap-2"><span aria-hidden>⚜</span> Récapitulatif officiel</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-4 gap-y-3 font-cormorant text-base">
          <dt className="text-texte-muet">N° de Declaratio</dt>
          <dd className="text-or-pale font-mono text-sm">{session.numeroDeclaratio}</dd>

          <dt className="text-texte-muet">Nom</dt>
          <dd className="text-texte-clair font-semibold">{session.identite?.prenom} {session.identite?.nom}</dd>

          <dt className="text-texte-muet">Date d'enregistrement</dt>
          <dd className="text-texte-clair">{dateEnreg}</dd>

          <dt className="text-texte-muet">Statut paiement</dt>
          <dd className="text-emerald-400">✓ Réglé — 77 €</dd>

          <dt className="text-texte-muet">Statut signature</dt>
          <dd className="text-emerald-400">✓ Signée</dd>

          <dt className="text-texte-muet">Statut KYC</dt>
          <dd className="text-or-pale">⏳ En cours de vérification</dd>

          <dt className="text-texte-muet">Émission Titulus Civilis</dt>
          <dd className="text-texte-clair">Programmée sous <strong className="text-or-pale">21 jours</strong> après validation KYC</dd>
        </dl>
      </div>

      {/* Et maintenant ? */}
      <div className="mb-10">
        <h2 className="titre-or text-center text-lg mb-6">Et maintenant ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="imperial-card">
            <div className="text-or text-2xl mb-2" aria-hidden>1.</div>
            <h3 className="titre-or text-sm mb-2">Vérification KYC</h3>
            <p className="font-cormorant text-base text-texte-clair leading-relaxed">
              Sous <strong className="text-or-pale">48 h</strong>, votre dossier sera examiné. Vous recevrez un e-mail de confirmation à l'issue.
            </p>
          </article>
          <article className="imperial-card">
            <div className="text-or text-2xl mb-2" aria-hidden>2.</div>
            <h3 className="titre-or text-sm mb-2">Émission de votre Titulus</h3>
            <p className="font-cormorant text-base text-texte-clair leading-relaxed">
              Carte sécurisée éditée et expédiée à l'adresse renseignée. Délai indicatif : <strong className="text-or-pale">21 jours</strong> après validation KYC.
            </p>
          </article>
          <article className="imperial-card">
            <div className="text-or text-2xl mb-2" aria-hidden>3.</div>
            <h3 className="titre-or text-sm mb-2">Accès au Consulat</h3>
            <p className="font-cormorant text-base text-texte-clair leading-relaxed">
              Un accès à votre espace personnel sur <span className="text-or-pale">gallia.space</span> vous sera transmis sous <strong className="text-or-pale">7 jours</strong>.
            </p>
          </article>
        </div>
      </div>

      {/* Boutons secondaires */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={reDownloadPdf}
          disabled={downloading}
          className="imperial-cta-secondary"
        >
          <span aria-hidden>⬇</span>
          {downloading ? 'Génération…' : 'Télécharger à nouveau ma Declaratio PDF'}
        </button>
        <a
          href="https://gallia.space"
          className="imperial-cta-secondary"
          onClick={() => reset()}
        >
          Retour au Consulat (gallia.space) →
        </a>
      </div>

      {/* E-mail confirmation envoi */}
      <p className="mt-8 text-center font-cormorant italic text-or-pale/70 text-sm">
        Un e-mail de confirmation a été expédié à <strong className="text-or-pale not-italic">{session.identite?.email}</strong>{' '}
        avec votre Declaratio en pièce jointe.
      </p>
    </FunnelLayout>
  )
}
