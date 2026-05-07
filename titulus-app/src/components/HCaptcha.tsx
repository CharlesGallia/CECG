/**
 * Widget hCaptcha — wrapper autour de @hcaptcha/react-hcaptcha.
 * Si VITE_HCAPTCHA_SITEKEY n'est pas configuré, retombe sur un stub
 * (utile en développement local et pour démarrer la première fois sans clé).
 */
import { useRef } from 'react'
import HCaptchaLib from '@hcaptcha/react-hcaptcha'
import HCaptchaStub from './HCaptchaStub'

type Props = {
  onVerify: (token: string) => void
}

const SITEKEY = import.meta.env.VITE_HCAPTCHA_SITEKEY as string | undefined

export default function HCaptcha({ onVerify }: Props) {
  const ref = useRef<HCaptchaLib | null>(null)

  if (!SITEKEY) return <HCaptchaStub onVerify={onVerify} />

  return (
    <div className="bg-noir-2 border border-or/40 rounded-sm p-3 inline-block">
      <HCaptchaLib
        ref={ref}
        sitekey={SITEKEY}
        theme="dark"
        onVerify={(token) => onVerify(token)}
        onExpire={() => onVerify('')}
        onError={(err) => console.warn('hCaptcha error:', err)}
      />
    </div>
  )
}
