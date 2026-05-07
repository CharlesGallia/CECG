/**
 * Sceau IGS — Imperio Gallorum Sociatis.
 * Reproduction stylisée du sceau officiel : disque noir bordé d'or,
 * mention "IMPERIO GALLORUM" en demi-cercle supérieur, "SOCIATIS" en demi-cercle inférieur,
 * deux lions héraldiques rampants, fleur de lys centrale, abeille en pied.
 *
 * Pour utiliser la vraie image officielle : déposer un PNG nommé `sceau-igs.png`
 * dans `public/assets/` — le composant `<Blason>` la chargera automatiquement.
 */
import { useId } from 'react'

type Props = {
  size?: number
  className?: string
}

export default function SceauIGS({ size = 180, className = '' }: Props) {
  const reactId = useId().replace(/[:]/g, '')
  const id = 'sceau-igs-' + reactId
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Sceau Imperio Gallorum Sociatis"
    >
      <defs>
        <radialGradient id={`${id}-disc`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#050505" />
        </radialGradient>
        <linearGradient id={`${id}-or`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8D9A8" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8C7A2E" />
        </linearGradient>
        <path
          id={`${id}-arc-top`}
          d="M 30,100 A 70,70 0 0 1 170,100"
          fill="none"
        />
        <path
          id={`${id}-arc-bot`}
          d="M 30,100 A 70,70 0 0 0 170,100"
          fill="none"
        />
      </defs>

      {/* Cercle externe */}
      <circle cx="100" cy="100" r="96" fill={`url(#${id}-disc)`} stroke={`url(#${id}-or)`} strokeWidth="2" />
      <circle cx="100" cy="100" r="84" fill="none" stroke={`url(#${id}-or)`} strokeWidth="1.2" opacity="0.9" />
      <circle cx="100" cy="100" r="78" fill="none" stroke={`url(#${id}-or)`} strokeWidth="0.5" opacity="0.5" />

      {/* Texte circulaire haut */}
      <text
        fontFamily="Cinzel, serif"
        fontSize="11"
        fontWeight="600"
        fill={`url(#${id}-or)`}
        letterSpacing="2.5"
      >
        <textPath href={`#${id}-arc-top`} startOffset="50%" textAnchor="middle">
          IMPERIO GALLORUM
        </textPath>
      </text>
      <text
        fontFamily="Cinzel, serif"
        fontSize="11"
        fontWeight="600"
        fill={`url(#${id}-or)`}
        letterSpacing="3"
      >
        <textPath href={`#${id}-arc-bot`} startOffset="50%" textAnchor="middle">
          SOCIATIS
        </textPath>
      </text>

      {/* Étoiles séparatrices */}
      <g fill={`url(#${id}-or)`}>
        <polygon points="22,100 25,97 28,100 25,103" />
        <polygon points="172,100 175,97 178,100 175,103" />
      </g>

      {/* Fleur de lys centrale */}
      <g transform="translate(100,108)">
        <path
          d="M 0,-38 C -5,-30 -8,-22 -6,-14 C -10,-18 -14,-16 -14,-10 C -14,-4 -8,0 -2,-2 L -2,8 C -8,8 -12,12 -12,18 C -12,22 -8,26 -2,24 L -2,30 L 2,30 L 2,24 C 8,26 12,22 12,18 C 12,12 8,8 2,8 L 2,-2 C 8,0 14,-4 14,-10 C 14,-16 10,-18 6,-14 C 8,-22 5,-30 0,-38 Z"
          fill={`url(#${id}-or)`}
        />
        <path
          d="M -16,-4 L 16,-4 L 14,2 L -14,2 Z"
          fill={`url(#${id}-or)`}
        />
      </g>

      {/* Lion gauche */}
      <g transform="translate(58,114)" fill={`url(#${id}-or)`}>
        <path d="M 0,0 C -4,-8 -10,-10 -14,-6 C -16,0 -14,6 -10,8 L -10,18 L -6,18 L -6,10 C -2,12 2,10 4,4 Z M -12,-2 C -10,-4 -8,-4 -6,-2 L -6,2 L -12,2 Z" />
        <circle cx="-9" cy="-2" r="1" fill="#0A0A0A" />
        <path d="M 4,4 L 10,6 L 8,12 L 4,10 Z" />
      </g>

      {/* Lion droit (miroir) */}
      <g transform="translate(142,114) scale(-1,1)" fill={`url(#${id}-or)`}>
        <path d="M 0,0 C -4,-8 -10,-10 -14,-6 C -16,0 -14,6 -10,8 L -10,18 L -6,18 L -6,10 C -2,12 2,10 4,4 Z M -12,-2 C -10,-4 -8,-4 -6,-2 L -6,2 L -12,2 Z" />
        <circle cx="-9" cy="-2" r="1" fill="#0A0A0A" />
        <path d="M 4,4 L 10,6 L 8,12 L 4,10 Z" />
      </g>

      {/* Abeille en pied */}
      <g transform="translate(100,148)" fill={`url(#${id}-or)`}>
        <ellipse cx="0" cy="0" rx="5" ry="7" />
        <path d="M -8,-2 L -2,-2 M 2,-2 L 8,-2" stroke={`url(#${id}-or)`} strokeWidth="1.2" opacity="0.7" />
        <path d="M -3,-3 L 3,-3 M -3,0 L 3,0 M -3,3 L 3,3" stroke="#0A0A0A" strokeWidth="0.8" />
        <ellipse cx="-5" cy="-3" rx="3" ry="2" fill={`url(#${id}-or)`} opacity="0.5" />
        <ellipse cx="5" cy="-3" rx="3" ry="2" fill={`url(#${id}-or)`} opacity="0.5" />
      </g>
    </svg>
  )
}
