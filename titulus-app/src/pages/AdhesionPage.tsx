/**
 * ÉTAPE II — ADHÉSION & PAIEMENT
 * Route : /adhesion
 *
 * — Manifeste éditorial "Bâtir Gallia"
 * — Pièce Gallibra (visuel)
 * — Bloc tarifaire : 6,42 €/mois (énorme) — soit 77 € paiement annuel unique
 * — Récap déclarant (lecture seule + lien "← Modifier")
 * — Case rétractation
 * — CTA : "Procéder au paiement sécurisé — 77 €" (stub Stripe)
 *
 * Pas de hCaptcha ici (Stripe Radar fait foi).
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FunnelLayout from '../components/FunnelLayout'
import SectionTitle from '../components/SectionTitle'
import Checkbox from '../components/Checkbox'
import GallibraCoin from '../assets/GallibraCoin'
import { useFunnel } from '../lib/funnelContextValue'

export default function AdhesionPage() {
  const navigate = useNavigate()
  const { session, update, updateConsents } = useFunnel()

  // Garde de route : pas d'identité => retour étape I
  useEffect(() => {
    if (!session.identite) navigate('/', { replace: true })
  }, [session.identite, navigate])

  if (!session.identite) return null

  function procederAuPaiement() {
    // V1 : stub. V2 : POST vers /api/stripe-checkout puis redirect.
    update({ paiementOk: true, status: 'PAIEMENT_OK' })
    navigate('/declaratio')
  }

  return (
    <FunnelLayout step="adhesion">
      <SectionTitle
        surtitre="Étape II · Adhésion"
        titre={<>Bâtir <span className="italic text-or">Gallia</span></>}
        soustitre="À quoi sert votre adhésion"
      />

      {/* Manifeste Bâtir Gallia */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-start mb-12">
        <article className="imperial-card relative overflow-hidden">
          <div aria-hidden className="absolute -top-10 -right-10 w-40 h-40 bg-or/5 rounded-full blur-3xl" />

          <p className="font-cormorant italic text-or-pale text-xl sm:text-2xl mb-6 leading-snug">
            Une Nation n'existe pleinement que lorsqu'elle bat monnaie.
          </p>

          <p className="font-cormorant text-lg leading-relaxed text-texte-clair mb-5">
            Votre contribution finance la pierre angulaire de la souveraineté retrouvée :
            la <span className="text-or italic font-semibold">Libra Gallica</span> — communément appelée{' '}
            <span className="text-or italic font-semibold">Gallibra</span> — monnaie souveraine de Gallia.
          </p>

          <h3 className="font-cinzel text-or-pale uppercase tracking-imperial-tight text-sm mb-3 mt-8">
            Votre adhésion sert à
          </h3>
          <ul className="space-y-2 mb-8 font-cormorant text-lg text-texte-clair">
            <li className="flex gap-3"><span className="text-or shrink-0">—</span> éditer et expédier votre <span className="italic text-or-pale">Titulus Civilis</span></li>
            <li className="flex gap-3"><span className="text-or shrink-0">—</span> soutenir la croissance du mouvement</li>
            <li className="flex gap-3">
              <span className="text-or shrink-0">—</span>
              <span>
                financer la <span className="italic text-or font-semibold">Gallibra</span> :
                banque en ligne gallienne, exchange souverain Gallibra ↔ Fiat, crypto adossée à la légitimité juridique de Gallia
              </span>
            </li>
          </ul>

          <h3 className="font-cinzel text-or-pale uppercase tracking-imperial-tight text-sm mb-3">
            Pourquoi c'est décisif
          </h3>
          <p className="font-cormorant text-lg leading-relaxed text-texte-clair mb-5">
            Comptes et épargne sont aujourd'hui exposés aux <span className="text-cardinal font-semibold">réquisitions et gels unilatéraux</span>.
            Gallia, État rétabli de droit, offrira un capital <span className="text-or-pale font-semibold">insaisissable</span> —
            fondé en droit international public.
          </p>
          <p className="font-cormorant italic text-or-pale text-lg mb-8">
            Vous paierez en euros ou en dollars. Votre capital, lui, demeurera préservé en <span className="text-or font-semibold not-italic">Gallibra</span>.
          </p>

          <h3 className="font-cinzel text-or-pale uppercase tracking-imperial-tight text-sm mb-3">
            Le geste fondateur
          </h3>
          <p className="font-cormorant text-lg leading-relaxed text-texte-clair">
            Battre monnaie n'est pas une promesse : c'est l'acte par lequel une Nation affirme son existence.
            Chaque Gallien qui se déclare aujourd'hui ne paie pas un service —
            <span className="text-or italic font-semibold"> il pose une pierre.</span>
          </p>

          <div className="filet-or my-8" />
          <div className="bg-gradient-to-r from-or via-or-pale to-or text-noir px-4 py-3 text-center font-cinzel text-xs sm:text-sm tracking-imperial uppercase font-semibold">
            ⚜ Phase fondatrice — Souscription des Galliens primo-déclarés
          </div>
        </article>

        {/* Pièce Gallibra */}
        <div className="hidden lg:flex flex-col items-center sticky top-8 shrink-0">
          <div aria-hidden className="absolute inset-0 bg-or/10 blur-3xl" />
          <GallibraCoin size={240} className="relative animate-pulse-or" />
          <p className="mt-3 text-center font-cormorant italic text-or-pale/80 text-sm max-w-[240px]">
            <span className="text-or font-semibold not-italic">100 GALLIBRA</span><br />
            <span className="text-xs">Primum Non Nocere</span>
          </p>
        </div>
      </div>

      {/* Bloc tarifaire — 6,42 €/mois géant */}
      <section
        aria-labelledby="tarif-titre"
        className="imperial-card-cardinal max-w-2xl mx-auto mb-10 text-center !p-8 sm:!p-12"
      >
        <div id="tarif-titre" className="font-cinzel uppercase tracking-imperial-wide text-or-pale text-sm mb-6">
          ⚜ Cotisation fondatrice
        </div>

        <div className="flex items-baseline justify-center gap-3 mb-2">
          <span className="font-cinzel text-or text-6xl sm:text-7xl lg:text-8xl font-bold leading-none">
            6,42&nbsp;€
          </span>
          <span className="font-cormorant italic text-or-pale text-xl sm:text-2xl">/ mois</span>
        </div>

        <p className="font-cormorant italic text-or-pale text-lg sm:text-xl mb-1">
          soit <span className="font-bold text-or not-italic">77&nbsp;€</span> — paiement annuel unique, sécurisé Stripe
        </p>
        <p className="font-sans text-texte-muet text-xs uppercase tracking-imperial-tight mb-8">
          Aucun renouvellement automatique
        </p>

        <ul className="text-left space-y-3 max-w-md mx-auto mb-2 font-cormorant text-base sm:text-lg text-texte-clair">
          <li className="flex gap-3"><span className="text-or shrink-0 font-bold">✓</span> Émission de votre <span className="italic">Titulus Civilis</span></li>
          <li className="flex gap-3"><span className="text-or shrink-0 font-bold">✓</span> Inscription au <span className="text-or-pale">registre fondateur</span></li>
          <li className="flex gap-3"><span className="text-or shrink-0 font-bold">✓</span> Rang d'<span className="text-or-pale">Aspirant Gallien</span></li>
          <li className="flex gap-3"><span className="text-or shrink-0 font-bold">✓</span> Accès prioritaire à la <span className="italic text-or">Gallibra</span></li>
        </ul>
      </section>

      {/* Récap déclarant */}
      <div className="imperial-card max-w-2xl mx-auto mb-8">
        <div className="flex items-start justify-between mb-3">
          <h3 className="titre-or text-sm">Récapitulatif</h3>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-sans text-xs text-or-pale/80 hover:text-or underline tracking-wider uppercase"
          >
            ← Modifier
          </button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 font-cormorant">
          <div>
            <dt className="text-texte-muet text-xs uppercase tracking-imperial-tight">Prénom</dt>
            <dd className="text-texte-clair text-lg">{session.identite.prenom}</dd>
          </div>
          <div>
            <dt className="text-texte-muet text-xs uppercase tracking-imperial-tight">Nom</dt>
            <dd className="text-texte-clair text-lg font-semibold">{session.identite.nom}</dd>
          </div>
          <div>
            <dt className="text-texte-muet text-xs uppercase tracking-imperial-tight">E-mail</dt>
            <dd className="text-texte-clair text-base break-all">{session.identite.email}</dd>
          </div>
        </dl>
      </div>

      {/* Rétractation */}
      <div className="imperial-card max-w-2xl mx-auto mb-8">
        <Checkbox
          checked={session.consents.retractation}
          onChange={(v) => updateConsents({ retractation: v })}
        >
          Je demande l'<span className="text-or-pale font-semibold">émission immédiate</span> de ma <span className="italic text-or">Titulus Civilis</span> dès validation du KYC,
          et reconnais que mon droit de rétractation 14 jours sera perdu pour la part du service exécutée
          (<span className="text-texte-muet">art. L221-25 Code de la consommation</span>). Le remboursement reste possible au prorata avant émission.
        </Checkbox>
      </div>

      {/* CTA paiement */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={procederAuPaiement}
          disabled={!session.consents.retractation}
          className="imperial-cta sm:!min-w-[420px]"
        >
          <span aria-hidden className="text-xl">⚜</span>
          Procéder au paiement sécurisé — 77 €
          <span aria-hidden>→</span>
        </button>
        <div className="flex items-center gap-3 text-texte-muet text-xs font-sans tracking-wider">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-or" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Paiement sécurisé · TLS · Stripe (Visa, Mastercard, Apple Pay, Google Pay)
        </div>
      </div>
    </FunnelLayout>
  )
}
