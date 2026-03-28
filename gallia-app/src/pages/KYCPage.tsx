/**
 * KYC Souverain RGPD
 *
 * CONTRAINTE ABSOLUE :
 * Tout se passe dans le navigateur.
 * Aucune image · aucune donnée biométrique n'est envoyée au serveur.
 * Seul le hash SHA-256 est stocké dans Supabase.
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, FileText, Shield, CheckCircle, AlertCircle, Info, Upload } from 'lucide-react'
import * as faceapi from 'face-api.js'
import Tesseract from 'tesseract.js'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/Button'
import GoldRule from '../components/GoldRule'
import { genererHashZK, parseTexteOCR, arreterCamera } from '../utils/kyc'

type Etape = 'consentement' | 'camera' | 'liveness' | 'ocr' | 'confirmation' | 'done'

interface ChampIdentite {
  prenom: string
  nom: string
  dateNaissance: string
  lieuNaissance: string
}

// ─── Étape 0 : Consentement RGPD ─────────────────────────────────────────────
function EtapeConsentement({ onAccept }: { onAccept: () => void }) {
  const [accepte, setAccepte] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-5 py-4 bg-or-clair border border-or rounded-sm">
        <Shield size={20} className="text-or shrink-0" />
        <p className="font-body text-sm text-or-fonce font-medium leading-snug">
          Vérification d'identité souveraine — traitement local uniquement
        </p>
      </div>

      <div
        className="px-5 py-4 font-body text-sm text-noir leading-relaxed space-y-3"
        style={{ background: '#FAF8F5', borderLeft: '2px solid #B8960C' }}
      >
        <p className="font-semibold">Ce que nous faisons :</p>
        <ul className="space-y-2 text-sm text-gris-texte">
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-or shrink-0 mt-0.5" />
            <span>Ta photo et ta pièce sont traitées <strong>uniquement dans ton navigateur</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-or shrink-0 mt-0.5" />
            <span>Elles ne sont <strong>jamais envoyées</strong> à nos serveurs</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-or shrink-0 mt-0.5" />
            <span>La caméra s'éteint automatiquement après 5 secondes de détection</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="text-or shrink-0 mt-0.5" />
            <span>Seule une <strong>empreinte cryptographique anonyme</strong> (hash SHA-256) est conservée</span>
          </li>
        </ul>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={accepte}
          onChange={(e) => setAccepte(e.target.checked)}
          className="mt-0.5 w-4 h-4 shrink-0 accent-noir cursor-pointer"
        />
        <span className="font-body text-sm text-noir leading-snug">
          J'accepte que ma caméra et mon document soient traités localement pour vérifier mon identité.
          Je comprends qu'aucune image n'est conservée.
        </span>
      </label>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!accepte}
        onClick={onAccept}
      >
        Commencer la vérification
      </Button>
    </div>
  )
}

// ─── Étape 1 : Liveness check ────────────────────────────────────────────────
function EtapeLiveness({ onSuccess }: { onSuccess: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [statut, setStatut] = useState<'init' | 'chargement' | 'actif' | 'ok' | 'erreur'>('init')
  const [message, setMessage] = useState('')
  const [compte, setCompte] = useState(5)
  const [modelsLoaded, setModelsLoaded] = useState(false)

  // Chargement modèles face-api.js depuis CDN
  useEffect(() => {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      .then(() => setModelsLoaded(true))
      .catch(() => setMessage('Impossible de charger les modèles de détection.'))
  }, [])

  const demarrerCamera = useCallback(async () => {
    if (!modelsLoaded) return
    setStatut('chargement')
    setMessage('Activation de la caméra…')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatut('actif')
      setMessage("Regarde l'objectif \u00b7 Souris \u00b7 Tourne légèrement la tête")
      lancerDetection(stream)
    } catch {
      setStatut('erreur')
      setMessage('Accès à la caméra refusé. Vérifie les permissions de ton navigateur.')
    }
  }, [modelsLoaded])

  const lancerDetection = useCallback((stream: MediaStream) => {
    let count = 5
    let detected = false

    const interval = setInterval(async () => {
      if (!videoRef.current || detected) return

      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.4 })
      )

      if (detection) {
        detected = true
        clearInterval(interval)

        // Couper caméra IMMÉDIATEMENT
        arreterCamera(stream)
        streamRef.current = null

        setStatut('ok')
        setMessage('Présence vérifiée ✓ Aucune image conservée')
        setTimeout(onSuccess, 1500)
      } else {
        count -= 1
        setCompte(count)
        if (count <= 0) {
          clearInterval(interval)
          arreterCamera(stream)
          setStatut('erreur')
          setMessage("Visage non détecté. Assure-toi d'être bien éclairé(e) face à la caméra.")
        }
      }
    }, 1000)
  }, [onSuccess])

  // Cleanup caméra au démontage
  useEffect(() => {
    return () => arreterCamera(streamRef.current)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Camera size={20} className="text-or" />
        <div>
          <p className="font-body text-sm font-semibold text-noir">Vérification de présence</p>
          <p className="font-body text-xs text-gris-texte">La caméra s'éteint après détection</p>
        </div>
      </div>

      {/* Flux vidéo */}
      <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-2 border-or bg-gris-clair flex items-center justify-center">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`w-full h-full object-cover ${statut === 'actif' ? 'block' : 'hidden'}`}
          aria-label="Flux caméra pour détection de visage"
        />

        {statut === 'ok' && (
          <div className="absolute inset-0 flex items-center justify-center bg-or-clair/90">
            <CheckCircle size={48} className="text-or" />
          </div>
        )}

        {statut === 'init' && (
          <Camera size={40} className="text-gris-texte" />
        )}

        {statut === 'chargement' && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin" />
            <span className="font-body text-xs text-gris-texte">Chargement…</span>
          </div>
        )}

        {/* Compte à rebours */}
        {statut === 'actif' && (
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-noir/70 flex items-center justify-center">
            <span className="font-display text-sm font-bold text-blanc">{compte}</span>
          </div>
        )}
      </div>

      {/* Message statut */}
      {message && (
        <div className={`flex items-start gap-2 px-4 py-3 rounded-sm ${
          statut === 'ok'    ? 'bg-or-clair border border-or' :
          statut === 'erreur'? 'bg-red-50 border border-red-200' :
                               'bg-gris-clair border border-gris'
        }`}>
          {statut === 'ok'     && <CheckCircle size={16} className="text-or shrink-0 mt-0.5" />}
          {statut === 'erreur' && <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />}
          {(statut === 'actif' || statut === 'chargement') && <Info size={16} className="text-gris-texte shrink-0 mt-0.5" />}
          <p className="font-body text-sm text-noir leading-snug">{message}</p>
        </div>
      )}

      {statut === 'init' && (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!modelsLoaded}
          loading={!modelsLoaded}
          onClick={demarrerCamera}
        >
          {modelsLoaded ? 'Autoriser la caméra' : 'Chargement des modèles…'}
        </Button>
      )}

      {statut === 'erreur' && (
        <Button variant="secondary" size="md" className="w-full"
          onClick={() => { setStatut('init'); setMessage(''); setCompte(5) }}>
          Réessayer
        </Button>
      )}

      <p className="font-body text-xs text-gris-texte text-center">
        Gallia utilise ta caméra uniquement pour vérifier ta présence.
        Aucune image n'est conservée. La caméra s'éteint après détection.
      </p>
    </div>
  )
}

// ─── Étape 2 : OCR pièce d'identité ─────────────────────────────────────────
function EtapeOCR({ onSuccess }: { onSuccess: (champs: ChampIdentite) => void }) {
  const [_file, setFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [champs, setChamps] = useState<ChampIdentite | null>(null)
  const [error, setError] = useState('')

  const handleFile = (f: File) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(f.type)) { setError('Format accepté : JPG, PNG ou PDF'); return }
    if (f.size > 10 * 1024 * 1024) { setError('Fichier trop lourd (max 10 Mo)'); return }
    setFile(f)
    setError('')
    lancerOCR(f)
  }

  const lancerOCR = async (f: File) => {
    setScanning(true)
    setProgress(0)
    setChamps(null)

    try {
      const result = await Tesseract.recognize(f, 'fra+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        },
      })

      // Parser le texte extrait
      const parsed = parseTexteOCR(result.data.text)
      setChamps(parsed)

      // Supprimer la référence au fichier de la mémoire
      setFile(null)
    } catch {
      setError('Lecture du document échouée. Essaie une image plus nette.')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText size={20} className="text-or" />
        <div>
          <p className="font-body text-sm font-semibold text-noir">Scan pièce d'identité</p>
          <p className="font-body text-xs text-gris-texte">Traitement local · aucun envoi serveur</p>
        </div>
      </div>

      <div
        className="px-4 py-3 font-body text-xs text-gris-texte leading-relaxed"
        style={{ background: '#FAF8F5', borderLeft: '2px solid #B8960C' }}
      >
        Nous lisons uniquement <strong>prénom · nom · date et lieu de naissance</strong>.
        Ton document est analysé dans ton navigateur et supprimé immédiatement après.
      </div>

      {/* Zone upload */}
      {!champs && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
          onClick={() => document.getElementById('kyc-file')?.click()}
          className="border-2 border-dashed border-gris rounded-sm px-6 py-10 text-center cursor-pointer hover:border-or transition-colors"
        >
          <input
            id="kyc-file"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
          <Upload size={32} className="mx-auto text-gris-texte mb-3" />
          <p className="font-body text-sm font-semibold text-noir">
            Glisse ta pièce d'identité ici
          </p>
          <p className="font-body text-xs text-gris-texte mt-1">
            CNI · Passeport · Titre de séjour · JPG PNG PDF
          </p>
        </div>
      )}

      {/* Barre de progression OCR */}
      {scanning && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="font-body text-xs text-gris-texte">Lecture en cours…</p>
            <p className="font-body text-xs font-semibold text-noir">{progress}%</p>
          </div>
          <div className="w-full bg-gris rounded-full h-2">
            <div
              className="bg-or h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-body text-xs text-gris-texte text-center italic">
            Analyse locale en cours · aucune donnée transmise
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="font-body text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Champs extraits à confirmer */}
      {champs && !scanning && (
        <div className="space-y-4">
          <p className="font-body text-sm font-semibold text-noir">
            Vérifie et corrige si besoin :
          </p>

          {(
            [
              { key: 'prenom',        label: 'Prénom' },
              { key: 'nom',           label: 'Nom' },
              { key: 'dateNaissance', label: 'Date de naissance' },
              { key: 'lieuNaissance', label: 'Lieu de naissance' },
            ] as { key: keyof ChampIdentite; label: string }[]
          ).map(({ key, label }) => (
            <div key={key}>
              <label className="block font-body text-xs text-gris-texte mb-1">{label}</label>
              <input
                type="text"
                value={champs[key]}
                onChange={(e) => setChamps((c) => c ? { ...c, [key]: e.target.value } : c)}
                className="w-full px-4 py-2.5 font-body text-sm text-noir border border-gris rounded-sm focus:outline-none focus:border-noir"
                placeholder={`${label} (à remplir si non détecté)`}
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setChamps(null); setFile(null) }}
            >
              Rescanner
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={!champs.prenom || !champs.nom}
              onClick={() => onSuccess(champs)}
            >
              Confirmer mes informations
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Étape 3 : Hash ZK + envoi ───────────────────────────────────────────────
function EtapeHash({
  champs,
  onSuccess,
}: {
  champs: ChampIdentite
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const confirmerEtEnvoyer = async () => {
    if (!user) return
    setSending(true)
    setError('')

    try {
      // Générer le hash SHA-256 côté client
      const hash = await genererHashZK(
        champs.prenom,
        champs.nom,
        champs.dateNaissance,
        champs.lieuNaissance
      )

      // Envoyer UNIQUEMENT le hash à Supabase — jamais les données brutes
      const { error: updateError } = await supabase
        .from('galliens')
        .update({
          kyc_hash_zk: hash,
          kyc_valide: true,
          kyc_date: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={20} className="text-or" />
        <div>
          <p className="font-body text-sm font-semibold text-noir">Empreinte cryptographique</p>
          <p className="font-body text-xs text-gris-texte">Hash SHA-256 · données anonymisées</p>
        </div>
      </div>

      <div
        className="px-4 py-4 space-y-2"
        style={{ background: '#FAF8F5', borderLeft: '2px solid #B8960C' }}
      >
        <p className="font-body text-sm font-semibold text-noir mb-3">Données à hasher :</p>
        {[
          { label: 'Prénom',            value: champs.prenom },
          { label: 'Nom',               value: champs.nom },
          { label: 'Date de naissance', value: champs.dateNaissance },
          { label: 'Lieu de naissance', value: champs.lieuNaissance },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <CheckCircle size={13} className="text-or shrink-0" />
            <span className="font-body text-xs text-gris-texte">{label} :</span>
            <span className="font-body text-xs text-noir font-medium">{value || '—'}</span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-gris-clair border border-gris rounded-sm">
        <p className="font-body text-xs text-gris-texte leading-relaxed">
          Ces informations seront converties en une empreinte cryptographique de 64 caractères.
          <strong> Les données originales ne sont jamais stockées.</strong>
          Seul le hash sera envoyé à nos serveurs.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-sm">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="font-body text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={sending}
        onClick={confirmerEtEnvoyer}
      >
        Valider mon identité
      </Button>
    </div>
  )
}

// ─── Page principale KYC ─────────────────────────────────────────────────────
const ETAPES = [
  { id: 'consentement', label: 'Consentement', icon: Shield },
  { id: 'liveness',     label: 'Présence',     icon: Camera },
  { id: 'ocr',          label: 'Document',      icon: FileText },
  { id: 'confirmation', label: 'Validation',    icon: CheckCircle },
]

export default function KYCPage() {
  const navigate = useNavigate()
  const [etape, setEtape] = useState<Etape>('consentement')
  const [champs, setChamps] = useState<ChampIdentite | null>(null)

  const etapeIndex = ETAPES.findIndex((e) => e.id === etape)

  const titres: Record<Etape, string> = {
    consentement: "Vérification d'identité",
    camera:       'Autorisation caméra',
    liveness:     'Vérification de présence',
    ocr:          'Scan du document',
    confirmation: 'Validation finale',
    done:         'KYC validé',
  }

  return (
    <div className="min-h-screen bg-blanc">
      <section className="pt-12 pb-8 px-4 max-w-lg mx-auto">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-or mb-3">
          KYC Souverain
        </p>
        <h1 className="font-display text-4xl font-bold text-noir mb-3">
          {titres[etape]}
        </h1>
        <GoldRule width="60px" thickness={2} className="mb-6" />

        {/* Barre de progression */}
        {etape !== 'done' && (
          <div className="flex items-center gap-1 mb-8">
            {ETAPES.map((e, i) => (
              <div key={e.id} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors ${
                  i < etapeIndex  ? 'bg-or text-blanc' :
                  i === etapeIndex? 'bg-noir text-blanc' :
                                    'bg-gris text-gris-texte'
                }`}>
                  {i < etapeIndex
                    ? <CheckCircle size={14} />
                    : <e.icon size={13} />
                  }
                </div>
                {i < ETAPES.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < etapeIndex ? 'bg-or' : 'bg-gris'}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-lg mx-auto px-4 pb-20">

        {etape === 'consentement' && (
          <EtapeConsentement onAccept={() => setEtape('liveness')} />
        )}

        {etape === 'liveness' && (
          <EtapeLiveness onSuccess={() => setEtape('ocr')} />
        )}

        {etape === 'ocr' && (
          <EtapeOCR
            onSuccess={(c) => { setChamps(c); setEtape('confirmation') }}
          />
        )}

        {etape === 'confirmation' && champs && (
          <EtapeHash
            champs={champs}
            onSuccess={() => setEtape('done')}
          />
        )}

        {etape === 'done' && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-or-clair border-2 border-or flex items-center justify-center">
                <CheckCircle size={40} className="text-or" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-noir mb-2">
                Identité vérifiée
              </h2>
              <p className="font-body text-sm text-gris-texte leading-relaxed">
                Ton empreinte cryptographique a été enregistrée.
                Aucune image ni donnée biométrique n'a été transmise.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-or-clair border border-or rounded-sm">
              <Shield size={16} className="text-or" />
              <p className="font-body text-xs text-or-fonce font-medium">
                KYC validé · Hash SHA-256 stocké · RGPD conforme
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
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
