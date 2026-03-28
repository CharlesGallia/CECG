import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft, CheckCircle, AlertCircle, Copy, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/Button'
import GoldRule from '../components/GoldRule'
import { getLienParrainage, genererQRCode, copierDansPresseP } from '../utils/parrainage'

type JustificatifType = 'rsa' | 'chomage' | 'etudiant' | 'autre'

const TYPES: { value: JustificatifType; label: string }[] = [
  { value: 'rsa',      label: 'RSA' },
  { value: 'chomage',  label: 'Chômage / ARE' },
  { value: 'etudiant', label: 'Étudiant(e)' },
  { value: 'autre',    label: 'Autre situation précaire' },
]

export default function SolidairePage() {
  const navigate = useNavigate()
  const { user, gallien, refreshGallien } = useAuth()

  const [type, setType] = useState<JustificatifType>('rsa')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [parrainagesCount, setParrainagesCount] = useState(0)

  const lienParrainage = gallien?.numero_cecg
    ? getLienParrainage(gallien.numero_cecg)
    : ''

  // Charger QR code + compteur parrainages si déjà solidaire
  useEffect(() => {
    if (!lienParrainage) return
    genererQRCode(lienParrainage).then(setQrCode)

    if (gallien?.cecg_statut === 'provisoire_solidaire' && user) {
      supabase
        .from('cecg_solidaire')
        .select('parrainages_count')
        .eq('gallien_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setParrainagesCount(data.parrainages_count)
        })
    }
  }, [lienParrainage, gallien, user])

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) validateAndSetFile(f)
  }

  const validateAndSetFile = (f: File) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(f.type)) {
      setError('Format accepté : JPG, PNG ou PDF')
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('Fichier trop lourd (max 5 Mo)')
      return
    }
    setFile(f)
    setError('')
  }

  const handleUpload = useCallback(async () => {
    if (!file || !user) return
    setUploading(true)
    setError('')

    try {
      // Upload dans bucket privé
      const ext = file.name.split('.').pop()
      const path = `${user.id}/justificatif_${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('justificatifs')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('justificatifs')
        .getPublicUrl(path)

      // Insérer dans cecg_solidaire
      const { error: insertError } = await supabase
        .from('cecg_solidaire')
        .upsert({
          gallien_id: user.id,
          justificatif_type: type,
          justificatif_url: publicUrl,
          statut: 'en_attente',
        })

      if (insertError) throw insertError

      // Mettre à jour statut CECG
      await supabase
        .from('galliens')
        .update({
          cecg_statut: 'provisoire_solidaire',
          cecg_chemin: 'solidaire',
          cecg_date: new Date().toISOString(),
        })
        .eq('id', user.id)

      refreshGallien()
      genererQRCode(lienParrainage).then(setQrCode)
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }, [file, user, type, lienParrainage, refreshGallien])

  const handleCopy = async () => {
    const ok = await copierDansPresseP(lienParrainage)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Si déjà provisoire_solidaire, afficher directement le dashboard parrainage
  const isAlreadySolidaire = gallien?.cecg_statut === 'provisoire_solidaire'

  return (
    <div className="min-h-screen bg-blanc">
      <section className="pt-12 pb-8 px-4 max-w-xl mx-auto">
        <button
          onClick={() => navigate('/cecg')}
          className="flex items-center gap-2 font-body text-sm text-gris-texte hover:text-noir transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <p className="font-body text-xs tracking-[0.3em] uppercase text-or mb-3">
          Chemin Solidaire
        </p>
        <h1 className="font-display text-4xl font-bold text-noir mb-3">
          Carte Provisoire Solidaire
        </h1>
        <GoldRule width="60px" thickness={2} className="mb-5" />
        <p className="font-body text-sm text-gris-texte leading-relaxed">
          Justifie ta situation et obtiens ta carte provisoire valable 6 mois.
          5 parrainages à 77 GL la rendent définitive.
        </p>
      </section>

      <section className="max-w-xl mx-auto px-4 pb-20">

        {/* ─── FORMULAIRE UPLOAD ─── */}
        {!done && !isAlreadySolidaire && (
          <>
            {/* Type justificatif */}
            <div className="mb-6">
              <p className="font-body text-sm font-medium text-noir mb-3">
                Ta situation actuelle
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setType(value)}
                    className={`px-4 py-2.5 rounded-sm font-body text-sm font-medium border transition-colors ${
                      type === value
                        ? 'bg-noir text-blanc border-noir'
                        : 'bg-blanc text-noir border-gris hover:border-or'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zone drag & drop */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`mb-6 border-2 border-dashed rounded-sm px-6 py-10 text-center cursor-pointer transition-colors ${
                file ? 'border-or bg-or-clair' : 'border-gris hover:border-or'
              }`}
            >
              <input
                id="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]) }}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle size={32} className="text-or" />
                  <p className="font-body text-sm font-semibold text-noir">{file.name}</p>
                  <p className="font-body text-xs text-gris-texte">
                    {(file.size / 1024 / 1024).toFixed(1)} Mo · Cliquer pour changer
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload size={32} className="text-gris-texte" />
                  <div>
                    <p className="font-body text-sm font-semibold text-noir">
                      Glisse ton justificatif ici
                    </p>
                    <p className="font-body text-xs text-gris-texte mt-1">
                      ou clique pour choisir · JPG · PNG · PDF · max 5 Mo
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="mb-6 font-body text-xs text-gris-texte leading-relaxed"
               style={{ borderLeft: '2px solid #B8960C', paddingLeft: '12px', background: '#FAF8F5', padding: '12px 12px 12px 14px', borderRadius: '2px' }}>
              Nous lisons uniquement ton document pour vérifier ta situation.
              Il est stocké de manière chiffrée et n'est jamais partagé.
            </p>

            {error && (
              <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <p className="font-body text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={uploading}
              disabled={!file || uploading}
              onClick={handleUpload}
            >
              Obtenir ma carte provisoire
            </Button>
          </>
        )}

        {/* ─── APRÈS UPLOAD ─── */}
        {(done || isAlreadySolidaire) && (
          <div className="space-y-6">
            {/* Confirmation */}
            <div className="flex items-start gap-3 px-5 py-4 bg-or-clair border border-or rounded-sm">
              <CheckCircle size={20} className="text-or shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm font-semibold text-noir">
                  Carte provisoire activée
                </p>
                <p className="font-body text-xs text-gris-texte mt-0.5 leading-snug">
                  Ton justificatif est en cours de vérification. Ta carte est valable 6 mois.
                </p>
              </div>
            </div>

            {/* Compteur parrainages */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-sm font-semibold text-noir">
                  Progression vers la carte définitive
                </p>
                <p className="font-display text-sm font-bold text-or">
                  {parrainagesCount}/5
                </p>
              </div>
              <div className="w-full bg-gris rounded-full h-2">
                <div
                  className="bg-or h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(parrainagesCount / 5) * 100}%` }}
                />
              </div>
              <p className="font-body text-xs text-gris-texte mt-2">
                {5 - parrainagesCount} parrainage{5 - parrainagesCount > 1 ? 's' : ''} à 77 GL restant{5 - parrainagesCount > 1 ? 's' : ''}
              </p>
            </div>

            <GoldRule />

            {/* Lien de parrainage */}
            <div>
              <p className="font-body text-sm font-semibold text-noir mb-3">
                Mon lien de parrainage
              </p>
              <div className="flex gap-2 mb-4">
                <div className="flex-1 px-3 py-2.5 bg-gris-clair rounded-sm font-body text-xs text-gris-texte truncate border border-gris">
                  {lienParrainage || '—'}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-or rounded-sm font-body text-xs font-medium text-noir hover:bg-or-clair transition-colors shrink-0"
                >
                  {copied ? <Check size={14} className="text-or" /> : <Copy size={14} />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="flex flex-col items-center gap-2 p-4 border border-gris rounded-sm bg-blanc">
                  <img src={qrCode} alt="QR code lien de parrainage" width={160} height={160} />
                  <p className="font-body text-xs text-gris-texte">Partage ce QR code</p>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              Accéder à mon espace
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
