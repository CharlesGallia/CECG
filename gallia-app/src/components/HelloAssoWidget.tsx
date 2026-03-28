import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface HelloAssoWidgetProps {
  onSuccess: () => void
  onCancel: () => void
}

const HELLOASSO_URL =
  import.meta.env.VITE_HELLOASSO_IFRAME_URL ??
  'https://www.helloasso.com/associations/gifter/adhesions/devenir-gallien/widget'

export default function HelloAssoWidget({ onSuccess, onCancel }: HelloAssoWidgetProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(700)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Sécurité : ignorer les messages qui ne viennent pas de HelloAsso
      if (!e.origin.includes('helloasso.com')) return

      const data = e.data

      // Détecter hauteur dynamique
      if (data?.height && typeof data.height === 'number') {
        setHeight(data.height)
      }

      // Détecter paiement réussi — 3 formats possibles
      const isSuccess =
        data?.type === 'helloasso:payment:success' ||
        data?.action === 'paymentSuccess' ||
        data?.event === 'payment_success'

      if (isSuccess) {
        onSuccess()
        return
      }

      // Détecter annulation
      const isCancel =
        data?.type === 'helloasso:payment:cancel' ||
        data?.action === 'paymentCancel' ||
        data?.event === 'payment_cancel'

      if (isCancel) {
        onCancel()
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onSuccess, onCancel])

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blanc z-10 min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-or" />
            <p className="font-body text-sm text-gris-texte">Chargement du paiement sécurisé…</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={HELLOASSO_URL}
        title="Paiement adhésion Gallia — HelloAsso"
        width="100%"
        height={height}
        frameBorder="0"
        scrolling="auto"
        allowTransparency
        onLoad={() => setLoading(false)}
        className="w-full rounded-sm"
        style={{ minHeight: 400 }}
      />
    </div>
  )
}
