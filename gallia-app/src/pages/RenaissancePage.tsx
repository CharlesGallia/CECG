import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Button from '../components/Button'
import Input from '../components/Input'
import GoldRule from '../components/GoldRule'

const SERMENT_TEXT = `Je, soussigné(e), en pleine conscience et pleine liberté, prononce ce jour le Serment Gallien.

Je reconnais appartenir à la communauté des Galliens, peuple souverain uni par les valeurs de dignité, de fraternité et de responsabilité envers la Terre et ses habitants.

Par ce serment, je m'engage solennellement :

ENVERS MES SEMBLABLES — À traiter chaque Gallien comme un frère ou une sœur, à porter assistance à ceux qui en ont besoin, à agir avec honnêteté et loyauté dans toutes mes relations au sein de la communauté. À ne jamais user de tromperie, de manipulation ou de violence pour servir mes intérêts au détriment d'autrui.

ENVERS LA TERRE — À respecter et protéger la nature qui nous nourrit et nous abrite. À prendre conscience de mon empreinte sur la Terre et à œuvrer, à la mesure de mes moyens, pour préserver ce bien commun à tous les vivants. À transmettre une Terre viable aux générations qui viendront après nous.

ENVERS GALLIA — À soutenir la communauté Gallienne dans son développement, à participer activement à sa vie, à défendre ses valeurs contre toute tentative de les dénaturer. À honorer les engagements pris envers mes frères et sœurs Galliens, et à porter haut la dignité de notre communauté souveraine.

Ce serment est prononcé librement, en connaissance de cause, et lie mon honneur.

Imperio Gallorum Sociatis.
Soveregnitas non negotiatur. Exercetur.`

export default function RenaissancePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const refCode = params.get('ref') ?? ''

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    dateNaissance: '',
    lieuNaissance: '',
    email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [engagement1, setEngagement1] = useState(false)
  const [engagement2, setEngagement2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [parrainPrenom, setParrainPrenom] = useState<string | null>(null)

  // Résoudre le parrain si ?ref= présent
  useEffect(() => {
    if (!refCode) return
    supabase
      .from('galliens')
      .select('prenom, numero_cecg')
      .eq('numero_cecg', refCode)
      .single()
      .then(({ data }) => {
        if (data) setParrainPrenom(data.prenom)
      })
  }, [refCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.prenom.trim())        e.prenom        = 'Le prénom est requis'
    if (!form.nom.trim())           e.nom           = 'Le nom est requis'
    if (!form.dateNaissance)        e.dateNaissance = 'La date de naissance est requise'
    if (!form.lieuNaissance.trim()) e.lieuNaissance = 'Le lieu de naissance est requis'
    if (!form.email.trim())         e.email         = "L'email est requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                    e.email         = 'Email invalide'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      // Résoudre parrain_id depuis numero_cecg (ref)
      let parrainId: string | null = null
      if (refCode) {
        const { data: parrain } = await supabase
          .from('galliens')
          .select('id')
          .eq('numero_cecg', refCode)
          .single()
        parrainId = parrain?.id ?? null
      }

      // Créer le compte Supabase Auth (lien magique envoyé auto)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: crypto.randomUUID(),
        options: {
          emailRedirectTo: `${window.location.origin}/cecg`,
          data: { prenom: form.prenom, nom: form.nom },
        },
      })
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Création de compte échouée')

      // INSERT gallien — parrain_id enregistré DÈS l'inscription
      const { error: insertError } = await supabase.from('galliens').insert({
        id: userId,
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        email: form.email.trim().toLowerCase(),
        parrain_id: parrainId,
        serment_signe: true,
        serment_date: new Date().toISOString(),
        cecg_statut: 'aucune',
        rgpd_consent: true,
        rgpd_date: new Date().toISOString(),
      })
      if (insertError) throw insertError

      // Email Acte de Renaissance via Edge Function
      await supabase.functions.invoke('envoyer-renaissance', {
        body: { gallienId: userId, prenom: form.prenom },
      })

      navigate('/merci')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue'
      if (msg.toLowerCase().includes('already')) {
        setErrors({ email: 'Cet email est déjà utilisé. Tu es peut-être déjà Gallien(ne) ?' })
      } else {
        setErrors({ submit: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = engagement1 && engagement2 && !loading

  return (
    <div className="min-h-screen bg-blanc">
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 text-center max-w-2xl mx-auto">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-or mb-6">
          Imperio Gallorum Sociatis
        </p>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-noir leading-tight mb-4">
          Deviens Gallien
        </h1>
        <GoldRule width="60px" thickness={2} centered className="mb-6" />
        <p className="font-display text-xl text-gris-texte italic">
          Reprends ce qui t'appartient
        </p>

        {parrainPrenom && (
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2.5 bg-or-clair border border-or rounded-sm">
            <span className="font-body text-sm text-or-fonce">
              Parrainé(e) par <strong>{parrainPrenom}</strong>
            </span>
          </div>
        )}
      </section>

      {/* Formulaire */}
      <section className="max-w-xl mx-auto px-4 pb-20">
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="prenom"
                label="Prénom"
                value={form.prenom}
                onChange={handleChange}
                error={errors.prenom}
                required
                autoComplete="given-name"
              />
              <Input
                name="nom"
                label="Nom"
                value={form.nom}
                onChange={handleChange}
                error={errors.nom}
                required
                autoComplete="family-name"
              />
            </div>
            <Input
              name="dateNaissance"
              label="Date de naissance"
              type="date"
              value={form.dateNaissance}
              onChange={handleChange}
              error={errors.dateNaissance}
              required
            />
            <Input
              name="lieuNaissance"
              label="Lieu de naissance (ville, pays)"
              value={form.lieuNaissance}
              onChange={handleChange}
              error={errors.lieuNaissance}
              required
              autoComplete="off"
            />
            <Input
              name="email"
              label="Adresse email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
            />
          </div>

          <GoldRule className="mb-8" />

          {/* Serment */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-noir mb-4">
              Le Serment Gallien
            </h2>
            <div
              className="max-h-56 overflow-y-auto rounded-sm px-5 py-4 text-sm font-body text-noir leading-relaxed whitespace-pre-line"
              style={{ background: '#FAF8F5', borderLeft: '2px solid #B8960C' }}
              tabIndex={0}
              aria-label="Texte du Serment Gallien — défiler pour lire"
            >
              {SERMENT_TEXT}
            </div>
          </div>

          {/* Engagements */}
          <div className="space-y-4 mb-8">
            {[
              {
                id: 'eng1',
                checked: engagement1,
                onChange: setEngagement1,
                label: "Je m'engage envers mes semblables, la Terre et Gallia, et prononce ce Serment librement et en pleine conscience.",
              },
              {
                id: 'eng2',
                checked: engagement2,
                onChange: setEngagement2,
                label: "Je confirme que les informations fournies sont exactes et m'engage à les maintenir à jour.",
              },
            ].map(({ id, checked, onChange, label }) => (
              <label key={id} className="flex items-start gap-3 cursor-pointer group">
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => onChange(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0 rounded-sm border-gris accent-noir cursor-pointer"
                />
                <span className="font-body text-sm text-noir leading-snug group-hover:text-or-fonce transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>

          {errors.submit && (
            <p className="mb-5 text-sm font-body text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3" role="alert">
              {errors.submit}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!canSubmit}
            className="w-full"
          >
            Je prononce ce Serment sur mon honneur
          </Button>

          <p className="mt-6 text-xs font-body text-gris-texte text-center leading-relaxed">
            Tes données sont traitées conformément au RGPD et ne sont jamais vendues.{' '}
            Tu peux exercer tes droits (accès, rectification, suppression) depuis ton profil à tout moment.
          </p>
        </form>
      </section>
    </div>
  )
}
