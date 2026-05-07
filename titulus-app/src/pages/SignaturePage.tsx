/**
 * ÉTAPE IV — SIGNATURE & TÉLÉCHARGEMENT PDF
 * Route : /signature
 *
 * — Aperçu HTML de la Declaratio (rappel)
 * — Canvas signature manuscrite + bouton EFFACER
 * — hCaptcha de second niveau
 * — CTA : Télécharger le PDF Declaratio (génération via @react-pdf/renderer)
 */
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import FunnelLayout from '../components/FunnelLayout'
import SectionTitle from '../components/SectionTitle'
import DeclaratioPreview from '../components/DeclaratioPreview'
import HCaptcha from '../components/HCaptcha'
import SignatureCanvas, { type SignatureCanvasHandle } from '../components/SignatureCanvas'
import DeclaratioPdf from '../pdf/DeclaratioPdf'
import { useFunnel } from '../lib/funnelContextValue'
import { genererNumeroDeclaratio } from '../utils/numero'
import { titulusApi } from '../lib/titulusApi'

export default function SignaturePage() {
  const navigate = useNavigate()
  const { session, update } = useFunnel()

  const padRef = useRef<SignatureCanvasHandle>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Garde de route
  useEffect(() => {
    if (!session.declaratio) navigate('/declaratio', { replace: true })
  }, [session.declaratio, navigate])

  const canSubmit = !isEmpty && hcaptchaToken !== null && !generating

  async function handleDownload() {
    setError(null)
    if (!padRef.current || padRef.current.isEmpty()) {
      setError('Veuillez tracer votre signature.')
      return
    }
    if (!hcaptchaToken) {
      setError('Veuillez compléter la vérification.')
      return
    }
    setGenerating(true)
    try {
      const signatureDataUrl = padRef.current.toDataURL()
      const numero = session.numeroDeclaratio ?? genererNumeroDeclaratio()

      const blob = await pdf(
        <DeclaratioPdf
          data={session.declaratio!}
          numero={numero}
          signatureDataUrl={signatureDataUrl}
        />
      ).toBlob()

      // Hash SHA-256 du PDF pour la traçabilité
      const buf = await blob.arrayBuffer()
      const hashBuf = await crypto.subtle.digest('SHA-256', buf)
      const pdfHash = Array.from(new Uint8Array(hashBuf))
        .slice(0, 8)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

      // Persister côté serveur
      await titulusApi.signDeclaratio(session.uuid, numero, signatureDataUrl, hcaptchaToken!, pdfHash)

      // Téléchargement local
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Declaratio-${numero}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      update({
        signatureDataUrl,
        numeroDeclaratio: numero,
        status: 'DECLARATIO_SIGNEE',
      })

      setTimeout(() => navigate('/kyc'), 400)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue lors de la génération du PDF. Réessayez.')
    } finally {
      setGenerating(false)
    }
  }

  if (!session.declaratio) return null

  return (
    <FunnelLayout step="signature">
      <SectionTitle
        surtitre="Étape IV · Confirmatio"
        titre="Lisez, Signez & Téléchargez"
        soustitre="Votre Declaratio Galliæ officielle — vérifiez chaque mention avant de signer"
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
        {/* Aperçu Declaratio */}
        <div>
          <div className="font-cinzel text-or-pale text-xs uppercase tracking-imperial mb-3 text-center">
            Aperçu de votre Declaratio
          </div>
          <DeclaratioPreview data={session.declaratio} liveBadge={false} />
        </div>

        {/* Bloc signature */}
        <div className="space-y-6">
          <div className="imperial-card !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-or/30 bg-noir">
              <div className="font-cinzel text-or text-xs sm:text-sm uppercase tracking-imperial flex items-center gap-2">
                <span aria-hidden>✍</span> Zone de signature officielle
              </div>
              <button
                type="button"
                onClick={() => padRef.current?.clear()}
                className="font-sans text-xs uppercase tracking-imperial-tight text-or-pale/80 hover:text-or"
              >
                Effacer
              </button>
            </div>
            <SignatureCanvas ref={padRef} onChange={setIsEmpty} />
            <div className="px-5 py-3 bg-noir-2 border-t border-or/20">
              <p className="font-cormorant italic text-or-pale/80 text-sm text-center">
                Tracez votre signature habituelle
              </p>
            </div>
          </div>

          <div>
            <div className="imperial-label">Vérification anti-robot (second niveau)</div>
            <HCaptcha onVerify={setHcaptchaToken} />
          </div>

          <div className="imperial-card-cardinal text-sm font-cormorant text-texte-clair">
            <div className="flex items-start gap-2">
              <span aria-hidden className="text-or shrink-0 mt-0.5">⚜</span>
              <p>
                <strong className="text-or-pale">Rappel rétractation</strong> — Vous demandez l'émission immédiate de votre <em className="text-or">Titulus Civilis</em>{' '}
                dès validation du KYC, et reconnaissez que le droit de rétractation 14 jours sera perdu pour la part du service exécutée
                (art. L221-25). Remboursement au prorata possible avant émission.
              </p>
            </div>
          </div>

          {error && (
            <div role="alert" className="text-cardinal font-sans text-sm border border-cardinal/40 bg-cardinal/10 px-4 py-2 rounded-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/declaratio')}
              className="imperial-cta-secondary"
            >
              ← Modifier
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!canSubmit}
              className="imperial-cta flex-1"
            >
              {generating ? (
                <>Génération du PDF…</>
              ) : (
                <>
                  <span aria-hidden>⬇</span>
                  Télécharger ma Declaratio PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </FunnelLayout>
  )
}
