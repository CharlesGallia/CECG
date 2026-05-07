/**
 * ÉTAPE III — DECLARATIO GALLIENNE (formulaire complet)
 * Route : /declaratio
 *
 * — Section A : État civil étendu
 * — Section B : Domiciliation
 * — Section C : Contact
 * — Aperçu LIVE de la Declaratio (mise à jour temps réel)
 * — Case Gallia Primum Non Nocere
 */
import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FunnelLayout from '../components/FunnelLayout'
import SectionTitle from '../components/SectionTitle'
import Field from '../components/Field'
import Checkbox from '../components/Checkbox'
import DeclaratioPreview from '../components/DeclaratioPreview'
import { useFunnel } from '../lib/funnelContextValue'
import { calculerAge } from '../utils/dates'
import { titulusApi } from '../lib/titulusApi'
import type { Declaratio } from '../types'

const PAYS = ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada', 'Allemagne', 'Italie', 'Espagne', 'Portugal', 'Royaume-Uni', 'Autre']
const NATIONALITES = ['Française', 'Belge', 'Suisse', 'Luxembourgeoise', 'Canadienne', 'Allemande', 'Italienne', 'Espagnole', 'Portugaise', 'Britannique', 'Autre']

export default function DeclaratioPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session, update, updateConsents } = useFunnel()
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Stripe redirige ici avec ?session_id=cs_test_xxx — on marque paiementOk côté client.
  // Le statut serveur a déjà été mis à jour par le webhook.
  useEffect(() => {
    if (searchParams.get('session_id')) {
      update({ paiementOk: true, status: 'PAIEMENT_OK' })
    }
  }, [searchParams, update])

  const [d, setD] = useState<Declaratio>(() => ({
    prenom: session.declaratio?.prenom ?? session.identite?.prenom ?? '',
    nom: session.declaratio?.nom ?? session.identite?.nom ?? '',
    nomGallien: session.declaratio?.nomGallien ?? '',
    dateNaissance: session.declaratio?.dateNaissance ?? '',
    lieuNaissance: session.declaratio?.lieuNaissance ?? '',
    paysNaissance: session.declaratio?.paysNaissance ?? 'France',
    nationalite: session.declaratio?.nationalite ?? 'Française',
    numeroVoie: session.declaratio?.numeroVoie ?? '',
    complementAdresse: session.declaratio?.complementAdresse ?? '',
    codePostal: session.declaratio?.codePostal ?? '',
    ville: session.declaratio?.ville ?? '',
    pays: session.declaratio?.pays ?? 'France',
    email: session.declaratio?.email ?? session.identite?.email ?? '',
    telephone: session.declaratio?.telephone ?? '',
  }))
  const [submitted, setSubmitted] = useState(false)

  // Garde de route : pas de paiement => retour étape II
  useEffect(() => {
    if (!session.identite) navigate('/', { replace: true })
    else if (!session.paiementOk) navigate('/adhesion', { replace: true })
  }, [session.identite, session.paiementOk, navigate])

  function set<K extends keyof Declaratio>(key: K, val: Declaratio[K]) {
    setD((prev) => ({ ...prev, [key]: val }))
  }

  const errors = useMemo(() => ({
    prenom: d.prenom.trim().length < 2 ? 'Prénom requis.' : '',
    nom: d.nom.trim().length < 2 ? 'Nom requis.' : '',
    dateNaissance: !d.dateNaissance ? 'Date requise.' : calculerAge(d.dateNaissance) < 18 ? 'Vous devez avoir 18 ans.' : '',
    lieuNaissance: d.lieuNaissance.trim().length < 2 ? 'Lieu requis.' : '',
    numeroVoie: d.numeroVoie.trim().length < 2 ? 'Adresse requise.' : '',
    codePostal: d.codePostal.trim().length < 4 ? 'Code postal requis.' : '',
    ville: d.ville.trim().length < 2 ? 'Ville requise.' : '',
    telephone: d.telephone.trim().length < 6 ? 'Téléphone requis (format international).' : '',
  }), [d])

  const formOk = !Object.values(errors).some((e) => e !== '') && session.consents.primumNonNocere

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    setApiError(null)
    if (!formOk) return
    setSubmitting(true)
    try {
      await titulusApi.saveDeclaratio(session.uuid, d, !!session.consents.primumNonNocere)
      update({ declaratio: d, status: 'DECLARATIO_OK' })
      navigate('/signature')
    } catch (err) {
      console.error(err)
      setApiError(err instanceof Error ? err.message : 'Erreur réseau.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!session.identite || !session.paiementOk) return null

  return (
    <FunnelLayout step="declaratio">
      <SectionTitle
        surtitre="Étape III · Declaratio"
        titre={<>Complétez votre <span className="italic text-or">Declaratio Galliæ</span></>}
        soustitre="Renseignements requis pour l'établissement officiel de votre titre"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulaire */}
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Section A */}
          <fieldset className="imperial-card">
            <legend className="titre-or text-sm px-2">A · État civil étendu</legend>
            <div className="space-y-5 mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Prénom(s)" required value={d.prenom} onChange={(e) => set('prenom', e.target.value)} error={submitted ? errors.prenom : ''} />
                <Field label="Nom de famille" required value={d.nom} onChange={(e) => set('nom', e.target.value.toUpperCase())} error={submitted ? errors.nom : ''} />
              </div>
              <Field
                label="Nom gallien choisi"
                value={d.nomGallien ?? ''}
                onChange={(e) => set('nomGallien', e.target.value)}
                hint="Optionnel — apparaîtra sur la Declaratio entre parenthèses."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date de naissance" type="date" required value={d.dateNaissance} onChange={(e) => set('dateNaissance', e.target.value)} error={submitted ? errors.dateNaissance : ''} />
                <Field label="Lieu de naissance (ville)" required value={d.lieuNaissance} onChange={(e) => set('lieuNaissance', e.target.value)} error={submitted ? errors.lieuNaissance : ''} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="imperial-label">Pays de naissance <span aria-hidden className="text-cardinal">*</span></label>
                  <select value={d.paysNaissance} onChange={(e) => set('paysNaissance', e.target.value)} className="imperial-input">
                    {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="imperial-label">Nationalité civile <span aria-hidden className="text-cardinal">*</span></label>
                  <select value={d.nationalite} onChange={(e) => set('nationalite', e.target.value)} className="imperial-input">
                    {NATIONALITES.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Section B */}
          <fieldset className="imperial-card">
            <legend className="titre-or text-sm px-2">B · Domiciliation</legend>
            <div className="space-y-5 mt-3">
              <Field label="Numéro et voie" required value={d.numeroVoie} onChange={(e) => set('numeroVoie', e.target.value)} error={submitted ? errors.numeroVoie : ''} placeholder="12 rue des Lilas" />
              <Field label="Complément d'adresse" value={d.complementAdresse ?? ''} onChange={(e) => set('complementAdresse', e.target.value)} placeholder="Bât. A, étage 2…" />
              <div className="grid grid-cols-[1fr_2fr] gap-4">
                <Field label="Code postal" required value={d.codePostal} onChange={(e) => set('codePostal', e.target.value)} error={submitted ? errors.codePostal : ''} />
                <Field label="Ville" required value={d.ville} onChange={(e) => set('ville', e.target.value)} error={submitted ? errors.ville : ''} />
              </div>
              <div>
                <label className="imperial-label">Pays <span aria-hidden className="text-cardinal">*</span></label>
                <select value={d.pays} onChange={(e) => set('pays', e.target.value)} className="imperial-input">
                  {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Section C */}
          <fieldset className="imperial-card">
            <legend className="titre-or text-sm px-2">C · Contact</legend>
            <div className="space-y-5 mt-3">
              <Field label="E-mail" type="email" required value={d.email} onChange={(e) => set('email', e.target.value.toLowerCase())} />
              <Field label="Téléphone" type="tel" required value={d.telephone} onChange={(e) => set('telephone', e.target.value)} placeholder="+33 6 12 34 56 78" hint="Format international E.164 — obligatoire pour expédition." error={submitted ? errors.telephone : ''} />
            </div>
          </fieldset>

          {/* Engagement Primum Non Nocere */}
          <div className="imperial-card-cardinal">
            <div className="font-cinzel text-or text-sm tracking-imperial uppercase mb-3 flex items-center gap-2">
              <span aria-hidden>⚜</span> Gallia Primum Non Nocere
            </div>
            <Checkbox
              checked={session.consents.primumNonNocere}
              onChange={(v) => updateConsents({ primumNonNocere: v })}
              required
            >
              Je déclare solennellement, sur mon honneur, adhérer au Principe Fondamental de Gallia : <em className="text-or-pale">Gallia Primum Non Nocere</em>.
              Je m'engage à préserver mon semblable comme moi-même, à ne porter atteinte à quiconque — par mes actes, mes paroles ou mes intentions —
              de quelque manière que ce soit, en quelque lieu, en quelque circonstance que ce soit. Je reconnais que cet engagement est consubstantiel
              à ma citoyenneté gallienne et que je le porte librement, en pleine conscience, sans réserve ni condition.
            </Checkbox>
            {submitted && !session.consents.primumNonNocere && (
              <p className="text-cardinal text-sm font-sans mt-2" role="alert">Cet engagement est obligatoire.</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 pt-4">
            {apiError && (
              <div role="alert" className="text-cardinal font-sans text-sm border border-cardinal/40 bg-cardinal/10 px-4 py-2 rounded-sm">
                {apiError}
              </div>
            )}
            <button type="submit" disabled={submitting} className="imperial-cta">
              <span aria-hidden className="text-xl">⚜</span>
              {submitting ? 'Enregistrement…' : 'Continuer vers la signature'}
              <span aria-hidden>→</span>
            </button>
          </div>
        </form>

        {/* Aperçu LIVE */}
        <div className="lg:sticky lg:top-8 self-start">
          <div className="font-cinzel text-or-pale text-xs uppercase tracking-imperial mb-3 text-center">
            Aperçu live de votre Declaratio
          </div>
          <DeclaratioPreview data={d} />
        </div>
      </div>
    </FunnelLayout>
  )
}
