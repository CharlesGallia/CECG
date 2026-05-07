/**
 * Canvas de signature manuscrite — utilise `signature_pad`.
 * Capture tactile + souris, fond parchemin, trait charcoal.
 */
import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import SignaturePad from 'signature_pad'

export type SignatureCanvasHandle = {
  clear: () => void
  isEmpty: () => boolean
  toDataURL: () => string
}

type Props = {
  onChange?: (empty: boolean) => void
}

const SignatureCanvas = forwardRef<SignatureCanvasHandle, Props>(function SignatureCanvas({ onChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const c = canvasRef.current!
      c.width = c.offsetWidth * ratio
      c.height = c.offsetHeight * ratio
      const ctx = c.getContext('2d')
      if (ctx) ctx.scale(ratio, ratio)
      padRef.current?.clear()
    }

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: '#F4ECD8',
      penColor: '#1E2A3B',
      minWidth: 0.8,
      maxWidth: 2.4,
      throttle: 8,
    })

    padRef.current.addEventListener('endStroke', () => {
      onChange?.(padRef.current!.isEmpty())
    })

    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      padRef.current?.off()
    }
  }, [onChange])

  useImperativeHandle(ref, () => ({
    clear: () => {
      padRef.current?.clear()
      onChange?.(true)
    },
    isEmpty: () => padRef.current?.isEmpty() ?? true,
    toDataURL: () => padRef.current?.toDataURL('image/png') ?? '',
  }), [onChange])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[280px] sm:h-[320px] block"
      style={{
        background: '#F4ECD8',
        borderRadius: '2px',
        touchAction: 'none',
      }}
      aria-label="Zone de signature manuscrite"
    />
  )
})

export default SignatureCanvas
