/**
 * ÉTAPE I — IDENTITÉ DE BASE
 * Route : /
 *
 * — Hero : blason couronné + sur-titre + titre principal + citation DUDH Art. 15
 * — Bloc texte introductif (manifeste court)
 * — Maquette de la Titulus Civilis (visuel produit)
 * — Formulaire : prénom, nom, e-mail
 * — 3 cases de consentement
 * — hCaptcha
 * — CTA : "Je poursuis vers l'adhésion →"
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FunnelLayout from '../components/FunnelLayout'
import SectionTitle from '../components/SectionTitle'
import Field from '../components/Field'
import Checkbox from '../components/Checkbox'
import HCaptchaStub from '../components/HCaptchaStub'
import BlasonCouronne from '../assets/BlasonCouronne'
import TitulusCardMock from '../assets/TitulusCardMock'
import { useFunnel } from '../lib/funnelContextValue'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function IdentitePage() {
  const navigate = useNavigate()
  const { session, update, updateConsents } = useFunnel()

  const [prenom, setPrenom] = useState(session.identite?.prenom ?? '')
  const [nom, setNom] = useState(session.identite?.nom ?? '')
  const [email, setEmail] = useState(session.identite?.email ?? '')
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const errors = {
    prenom: prenom.trim().length < 2 ? 'Prénom requis (2 caractères minimum).' : prenom.trim().length > 50 ? 'Maximum 50 caractères.' : '',
    nom:    nom.trim().length < 2 ? 'Nom requis (2 caractères minimum).' : nom.trim().length > 50 ? 'Maximum 50 caractères.' : '',
    email:  !EMAIL_RE.test(email.trim()) ? 'Adresse e-mail invalide.' : '',
  }
  const consentsOk =
    session.consents.fondements &&
    session.consents.rgpd &&
    session.consents.libreVolonte
  const formOk =
    !errors.prenom && !errors.nom && !errors.email &&
    consentsOk && hcaptchaToken !== null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!formOk) return
    update({
      identite: {
        prenom: prenom.trim(),
        nom: nom.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
      },
      status: 'IDENTITE_OK',
    })
    navigate('/adhesion')
  }

  return (
    <FunnelLayout step="identite">
      {/* Hero */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="flex justify-center mb-6">
          <BlasonCouronne size={240} className="drop-shadow-[0_0_40px_rgba(201,168,76,0.35)]" />
        </div>

        <SectionTitle
          surtitre="Imperio Gallorum Sociatis · Titulus Civilis"
          titre={
            <>
              Recevez votre{' '}
              <span className="italic text-or">Titulus Civilis</span>{' '}
              Souverain
            </>
          }
          citation={
            <>
              « Nul ne peut être arbitrairement privé de sa nationalité, ni du droit de changer de nationalité. »
              <br />
              <span className="not-italic text-cardinal font-semibold">— DUDH, Article 15</span>
            </>
          }
        />
      </div>

      {/* Visuel produit : carte Titulus Civilis */}
      <div className="flex justify-center mb-12">
        <div className="relative">
          <div aria-hidden className="absolute -inset-8 bg-or/5 blur-3xl rounded-full" />
          <div className="relative transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
            <TitulusCardMock prenom="Charles" nom="POURLIER" />
          </div>
          <p className="mt-4 text-center font-cormorant italic text-or-pale/70 text-sm">
            Maquette indicative — votre titre personnalisé sera émis après validation KYC
          </p>
        </div>
      </div>

      {/* Bloc texte introductif */}
      <div className="imperial-card mb-10 max-w-3xl mx-auto">
        <p className="font-cormorant text-lg leading-relaxed text-texte-clair">
          La <span className="text-or italic">Titulus Civilis</span> est le titre civil souverain de Gallia,
          délivré par le <span className="text-or-pale">Consulat de Gallia</span> sous l'autorité de l'<span className="text-or-pale">Imperio Gallorum Sociatis</span>.
          Elle atteste l'inscription de son porteur au registre des Galliens primo-déclarés et constitue le support physique de votre citoyenneté.
        </p>
        <div className="filet-or my-5" />
        <p className="font-cormorant text-lg leading-relaxed text-or-pale italic">
          Cette souscription marque votre engagement de phase fondatrice. Renseignez ci-dessous votre identité de base —
          vous compléterez votre <span className="font-semibold not-italic">Declaratio</span> à l'étape III.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-2xl mx-auto">
        <h2 className="titre-or text-xl mb-2">Identité de base</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="Prénom"
            type="text"
            required
            autoComplete="given-name"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            error={submitted ? errors.prenom : ''}
            maxLength={50}
          />
          <Field
            label="Nom de famille"
            type="text"
            required
            autoComplete="family-name"
            value={nom}
            onChange={(e) => setNom(e.target.value.toUpperCase())}
            error={submitted ? errors.nom : ''}
            maxLength={50}
            hint="Affiché en majuscules sur votre Declaratio."
          />
        </div>

        <Field
          label="Adresse e-mail"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={submitted ? errors.email : ''}
          inputMode="email"
        />

        {/* 3 consentements */}
        <div className="imperial-card-cardinal space-y-5 !p-6">
          <div className="font-cinzel text-or text-sm tracking-imperial uppercase mb-3">
            ⚜ Engagements préalables
          </div>

          <Checkbox
            checked={session.consents.fondements}
            onChange={(v) => updateConsents({ fondements: v })}
            required
          >
            Je reconnais les <span className="text-or-pale font-semibold">sept fondements de droit international</span>{' '}
            ci-dessus et leur pertinence pour fonder ma démarche de déclaration gallienne.
          </Checkbox>

          <Checkbox
            checked={session.consents.rgpd}
            onChange={(v) => updateConsents({ rgpd: v })}
            required
          >
            J'accepte le traitement de mes données personnelles par <span className="text-or-pale font-semibold">GIFTER (SIREN 533 624 649)</span>{' '}
            dans le cadre strict de ma souscription à la <span className="italic text-or">Titulus Civilis</span>, conformément au RGPD.
          </Checkbox>

          <Checkbox
            checked={session.consents.libreVolonte}
            onChange={(v) => updateConsents({ libreVolonte: v })}
            required
          >
            Je déclare agir <span className="font-semibold">librement, en pleine conscience</span>, sans contrainte extérieure de quelque nature que ce soit.
          </Checkbox>

          {submitted && !consentsOk && (
            <p className="text-cardinal text-sm font-sans" role="alert">
              Les trois consentements sont requis pour poursuivre.
            </p>
          )}
        </div>

        {/* hCaptcha */}
        <div>
          <div className="imperial-label mb-2">Vérification anti-robot</div>
          <HCaptchaStub onVerify={setHcaptchaToken} />
          {submitted && hcaptchaToken === null && (
            <p className="mt-2 text-cardinal text-sm font-sans" role="alert">
              Veuillez compléter la vérification.
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="pt-4 flex justify-center">
          <button type="submit" className="imperial-cta">
            <span aria-hidden className="text-xl">⚜</span>
            Je poursuis vers l'adhésion
            <span aria-hidden>→</span>
          </button>
        </div>

        <p className="text-center text-texte-muet text-xs font-sans tracking-wider">
          Étape suivante : règlement de la cotisation fondatrice 77 € via Stripe
        </p>
      </form>
    </FunnelLayout>
  )
}
