/**
 * Composant Blason : utilise la vraie image PNG si elle est présente dans `public/assets/`,
 * sinon retombe sur le SVG inline `SceauIGS`.
 *
 * À déposer côté utilisateur :
 *   public/assets/sceau-igs.png   (≥ 512 px, fond transparent)
 */
import { useState } from 'react'
import SceauIGS from './SceauIGS'

type Props = {
  size?: number
  src?: string
  className?: string
}

export default function Blason({ size = 60, src = '/assets/sceau-igs.png', className = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return <SceauIGS size={size} className={className} />
  }

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="Sceau Imperio Gallorum Sociatis"
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  )
}
