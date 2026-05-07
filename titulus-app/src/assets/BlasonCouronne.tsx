/**
 * Blason couronné IGS — version stylisée pour le hero de l'étape I.
 * Couronne impériale + blason rond avec fleur de lys, halo doré.
 */
import { useId } from 'react'

type Props = {
  size?: number
  className?: string
}

export default function BlasonCouronne({ size = 280, className = '' }: Props) {
  const reactId = useId().replace(/[:]/g, '')
  const id = 'blason-' + reactId
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 280 280"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Blason couronné Imperio Gallorum Sociatis"
    >
      <defs>
        <radialGradient id={`${id}-halo`} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#C9A84C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-or`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8D9A8" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8C7A2E" />
        </linearGradient>
        <radialGradient id={`${id}-disc`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
      </defs>

      {/* Halo doré */}
      <circle cx="140" cy="155" r="130" fill={`url(#${id}-halo)`} />

      {/* Couronne impériale */}
      <g transform="translate(140,55)" fill={`url(#${id}-or)`}>
        <path d="M -50,20 L -45,-10 L -30,5 L -15,-20 L 0,0 L 15,-20 L 30,5 L 45,-10 L 50,20 Z" />
        <path d="M -50,20 L 50,20 L 50,28 L -50,28 Z" />
        <circle cx="-45" cy="-12" r="3.5" />
        <circle cx="-15" cy="-22" r="3.5" />
        <circle cx="0" cy="-2" r="3.5" />
        <circle cx="15" cy="-22" r="3.5" />
        <circle cx="45" cy="-12" r="3.5" />
        <path d="M -52,28 L -54,40 L -50,40 L -48,32 Z M 52,28 L 54,40 L 50,40 L 48,32 Z" />
        {/* Croix sommitale */}
        <path d="M 0,-32 L 0,-22 M -5,-27 L 5,-27" stroke={`url(#${id}-or)`} strokeWidth="2.5" />
      </g>

      {/* Blason rond */}
      <circle cx="140" cy="160" r="80" fill={`url(#${id}-disc)`} stroke={`url(#${id}-or)`} strokeWidth="3" />
      <circle cx="140" cy="160" r="72" fill="none" stroke={`url(#${id}-or)`} strokeWidth="1" opacity="0.6" />

      {/* Fleur de lys centrale grande */}
      <g transform="translate(140,160)" fill={`url(#${id}-or)`}>
        <path
          d="M 0,-50 C -8,-40 -12,-28 -8,-18 C -14,-22 -22,-20 -22,-12 C -22,-4 -14,2 -4,-2 L -4,12 C -12,12 -18,18 -18,26 C -18,32 -12,36 -4,32 L -4,40 L 4,40 L 4,32 C 12,36 18,32 18,26 C 18,18 12,12 4,12 L 4,-2 C 14,2 22,-4 22,-12 C 22,-20 14,-22 8,-18 C 12,-28 8,-40 0,-50 Z"
        />
        <path d="M -22,-2 L 22,-2 L 19,6 L -19,6 Z" />
      </g>

      {/* Mention en demi-cercle */}
      <defs>
        <path id={`${id}-arc`} d="M 70,160 A 70,70 0 0 1 210,160" fill="none" />
      </defs>
      <text
        fontFamily="Cinzel, serif"
        fontSize="10"
        fontWeight="600"
        fill={`url(#${id}-or)`}
        letterSpacing="2.5"
        opacity="0.85"
      >
        <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
          GALLIA AETERNA
        </textPath>
      </text>
    </svg>
  )
}
