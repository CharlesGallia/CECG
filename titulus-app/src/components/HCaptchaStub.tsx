/**
 * Stub hCaptcha — V1.
 * En V2, remplacer par `@hcaptcha/react-hcaptcha` avec la clé publique GIFTER (VITE_HCAPTCHA_SITEKEY).
 *
 * Stub actuel : case visuelle "Je ne suis pas un robot" qui s'auto-valide après clic.
 */
import { useState } from 'react'

type Props = {
  onVerify: (token: string) => void
}

export default function HCaptchaStub({ onVerify }: Props) {
  const [verified, setVerified] = useState(false)

  function handleClick() {
    if (verified) return
    setTimeout(() => {
      setVerified(true)
      onVerify('stub-hcaptcha-token-' + Date.now())
    }, 600)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className="
        inline-flex items-center gap-3 px-4 py-3 min-h-[60px]
        bg-noir-2 border border-or/40 rounded-sm cursor-pointer
        hover:border-or/70 transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-or
      "
      aria-pressed={verified}
      aria-label="Vérification anti-robot hCaptcha"
    >
      <div
        className={
          'w-6 h-6 rounded border flex items-center justify-center transition-all ' +
          (verified ? 'bg-or border-or' : 'bg-noir border-or/60')
        }
      >
        {verified && (
          <svg viewBox="0 0 16 16" className="w-4 h-4 text-noir" fill="currentColor">
            <path d="M6.5 11.5L3 8l1.4-1.4 2.1 2.1L11.6 4l1.4 1.4z"/>
          </svg>
        )}
      </div>
      <span className="font-sans text-sm text-texte-clair">
        Je ne suis pas un robot
      </span>
      <span className="ml-auto font-sans text-[10px] text-texte-muet tracking-wider uppercase">
        hCaptcha
      </span>
    </div>
  )
}
