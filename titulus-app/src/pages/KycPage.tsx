/**
 * ÉTAPE V — KYC (PIÈCES D'IDENTITÉ)
 * Route : /kyc
 *
 * Trois uploads : pièce d'identité (recto), selfie, preuve de vie datée.
 * Mention RGPD + purge 48 h.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FunnelLayout from '../components/FunnelLayout'
import SectionTitle from '../components/SectionTitle'
import UploadZone from '../components/UploadZone'
import Checkbox from '../components/Checkbox'
import { useFunnel } from '../lib/funnelContextValue'

export default function KycPage() {
  const navigate = useNavigate()
  const { session, update, updateConsents } = useFunnel()

  const [recto, setRecto] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)
  const [preuveVie, setPreuveVie] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Garde de route
  useEffect(() => {
    if (!session.signatureDataUrl) navigate('/signature', { replace: true })
  }, [session.signatureDataUrl, navigate])

  const dateAuj = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const allFilesOk = !!recto && !!selfie && !!preuveVie
  const canSubmit = allFilesOk && session.consents.pieceCertifiee

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!canSubmit) return
    // V1 : on n'upload pas réellement — V2 : POST vers bucket privé Supabase Storage.
    update({
      kycTransmis: true,
      status: 'KYC_TRANSMIS',
    })
    navigate('/confirmation')
  }

  function copyDate() {
    navigator.clipboard?.writeText(`Gallia · ${dateAuj}`)
  }

  if (!session.signatureDataUrl) return null

  return (
    <FunnelLayout step="kyc">
      <SectionTitle
        surtitre="Étape V · Verificatio"
        titre="Vérification d'Identité"
        soustitre="Trois pièces requises pour l'émission de votre Titulus Civilis"
      />

      {/* Mention RGPD */}
      <div className="imperial-card-cardinal mb-8 max-w-3xl mx-auto">
        <div className="font-cinzel text-or text-sm tracking-imperial uppercase mb-3 flex items-center gap-2">
          <span aria-hidden>⚠</span> Mention RGPD essentielle
        </div>
        <p className="font-cormorant text-base sm:text-lg leading-relaxed text-texte-clair">
          Vos pièces d'identité sont transmises uniquement aux fins de <strong className="text-or-pale">vérification de votre titularité</strong>.
          Elles sont conservées de manière strictement temporaire et <strong className="text-or-pale">purgées automatiquement sous 48 h</strong> après validation,
          conformément au principe de minimisation (art. 5.1.c RGPD). Aucune copie n'est archivée par GIFTER ni par le Consulat de Gallia.
          Seul le statut de validation (validé / refusé) et un hash anonymisé sont conservés à des fins de traçabilité.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <UploadZone
          id="kyc-recto"
          icon="🪪"
          label="Recto CNI ou Passeport"
          description="Toutes les mentions doivent être lisibles. Vous pouvez masquer les informations facultatives mais conservez nom, prénom, date de naissance, numéro et photo."
          file={recto}
          onChange={setRecto}
        />
        <UploadZone
          id="kyc-selfie"
          icon="📸"
          label="Selfie sur fond clair"
          description="Photo de votre visage, fond blanc ou clair uni, sans lunettes de soleil ni couvre-chef."
          file={selfie}
          onChange={setSelfie}
        />
        <UploadZone
          id="kyc-preuve"
          icon="✋"
          label="Preuve de vie datée"
          description={`Selfie tenant une feuille manuscrite portant la mention « Gallia · ${dateAuj} » ainsi que votre pièce d'identité.`}
          file={preuveVie}
          onChange={setPreuveVie}
        />

        {/* Date du jour copiable */}
        <div className="md:col-span-3 flex items-center justify-center gap-3 text-texte-muet text-sm font-sans">
          <span>Mention à reproduire :</span>
          <code className="px-2 py-1 bg-noir-2 border border-or/30 text-or-pale rounded-sm font-mono">
            Gallia · {dateAuj}
          </code>
          <button
            type="button"
            onClick={copyDate}
            className="text-or hover:underline uppercase tracking-wider text-xs"
          >
            Copier
          </button>
        </div>

        {/* Récap latéral */}
        <aside className="md:col-span-3 imperial-card !p-5">
          <h3 className="titre-or text-sm mb-3">Récapitulatif</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 font-cormorant text-sm">
            <div className="flex justify-between border-b border-or/15 py-1">
              <dt className="text-texte-muet">Nom, prénom déclaré</dt>
              <dd className="text-texte-clair font-semibold">{session.identite?.prenom} {session.identite?.nom}</dd>
            </div>
            <div className="flex justify-between border-b border-or/15 py-1">
              <dt className="text-texte-muet">N° de Declaratio</dt>
              <dd className="text-or-pale font-mono text-xs">{session.numeroDeclaratio ?? '—'}</dd>
            </div>
            <div className="flex justify-between border-b border-or/15 py-1">
              <dt className="text-texte-muet">Statut paiement</dt>
              <dd className="text-emerald-400">✓ Réglé</dd>
            </div>
            <div className="flex justify-between border-b border-or/15 py-1">
              <dt className="text-texte-muet">Statut signature</dt>
              <dd className="text-emerald-400">✓ Signée</dd>
            </div>
            <div className="flex justify-between sm:col-span-2 py-1">
              <dt className="text-texte-muet">Statut KYC</dt>
              <dd className="text-or-pale">⏳ En cours</dd>
            </div>
          </dl>
        </aside>

        {/* Case finale */}
        <div className="md:col-span-3 imperial-card-cardinal">
          <Checkbox
            checked={session.consents.pieceCertifiee}
            onChange={(v) => updateConsents({ pieceCertifiee: v })}
            required
          >
            Je certifie sur l'honneur que les pièces transmises sont <strong className="text-or-pale">authentiques et m'appartiennent</strong>.
            Toute fausse déclaration entraîne l'annulation immédiate de l'inscription sans remboursement de la part exécutée du service.
          </Checkbox>
          {submitted && !session.consents.pieceCertifiee && (
            <p className="text-cardinal text-sm font-sans mt-2" role="alert">Cette certification est obligatoire.</p>
          )}
          {submitted && !allFilesOk && (
            <p className="text-cardinal text-sm font-sans mt-2" role="alert">Les trois pièces sont requises.</p>
          )}
        </div>

        <div className="md:col-span-3 flex justify-center pt-4">
          <button type="submit" disabled={!canSubmit} className="imperial-cta">
            <span aria-hidden className="text-xl">⚜</span>
            Transmettre et valider ma demande
            <span aria-hidden>→</span>
          </button>
        </div>
      </form>
    </FunnelLayout>
  )
}
