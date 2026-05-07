/**
 * Zone d'upload drag & drop avec aperçu, validation taille/type.
 */
import { useRef, useState, useCallback } from 'react'
import { cn } from '../utils/cn'

const ACCEPT = 'image/jpeg,image/png,image/heic,image/heif,application/pdf'
const MAX_BYTES = 8 * 1024 * 1024

type Props = {
  id: string
  label: string
  description: string
  icon?: string
  file: File | null
  onChange: (f: File | null) => void
}

function fmtBytes(b: number) {
  if (b < 1024) return `${b} o`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} ko`
  return `${(b / 1024 / 1024).toFixed(1)} Mo`
}

export default function UploadZone({ id, label, description, icon = '📄', file, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFile = useCallback((f: File | null) => {
    setError(null)
    if (!f) {
      onChange(null)
      setPreviewUrl(null)
      return
    }
    if (f.size > MAX_BYTES) {
      setError(`Fichier trop volumineux (max 8 Mo). Taille reçue : ${fmtBytes(f.size)}.`)
      return
    }
    if (!ACCEPT.split(',').includes(f.type) && !f.name.toLowerCase().match(/\.(jpe?g|png|heic|heif|pdf)$/i)) {
      setError('Format non accepté. Formats : JPG, PNG, HEIC, PDF.')
      return
    }
    onChange(f)
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }, [onChange])

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDrag(true)
  }
  function onDragLeave() { setDrag(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0] ?? null
    handleFile(f)
  }

  return (
    <div className="imperial-card !p-5">
      <div className="font-cinzel text-or text-xs sm:text-sm uppercase tracking-imperial mb-3 flex items-center gap-2">
        <span aria-hidden>{icon}</span>
        {label}
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={`Téléverser ${label}`}
        className={cn(
          'border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors',
          drag ? 'border-or bg-or/5' : 'border-or/40 hover:border-or/70',
          file && !error && 'border-or bg-or/5',
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={ACCEPT}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        {!file && (
          <>
            <div className="text-or-pale text-3xl mb-2" aria-hidden>⬆</div>
            <div className="font-cormorant text-texte-clair">
              Glissez-déposez votre fichier ou <span className="text-or underline">cliquez ici</span>
            </div>
            <div className="font-sans text-xs text-texte-muet mt-2 tracking-wider">
              JPG · PNG · HEIC · PDF — max 8 Mo
            </div>
          </>
        )}
        {file && (
          <div className="flex items-center justify-center gap-3">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="max-h-24 rounded-sm border border-or/40" />
            ) : (
              <div className="text-3xl" aria-hidden>📄</div>
            )}
            <div className="text-left">
              <div className="text-or-pale text-sm font-medium font-sans truncate max-w-[180px]">{file.name}</div>
              <div className="text-texte-muet text-xs font-sans">{fmtBytes(file.size)}</div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleFile(null) }}
                className="text-cardinal text-xs font-sans uppercase tracking-wider hover:underline mt-1"
              >
                Retirer
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-texte-muet font-cormorant italic leading-relaxed">{description}</p>

      {error && (
        <p role="alert" className="mt-2 text-sm text-cardinal font-sans">{error}</p>
      )}
    </div>
  )
}
