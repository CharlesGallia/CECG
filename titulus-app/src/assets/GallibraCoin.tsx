/**
 * Pièce Gallibra (Libra Gallica) — illustration du bloc "Bâtir Gallia" à l'étape II.
 */
import { useId } from 'react'

type Props = {
  size?: number
  className?: string
}

export default function GallibraCoin({ size = 220, className = '' }: Props) {
  const reactId = useId().replace(/[:]/g, '')
  const id = 'coin-' + reactId
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Pièce Gallibra · 100 GALLIBRA · Primum Non Nocere"
    >
      <defs>
        <radialGradient id={`${id}-gold`} cx="35%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#F5E5A8" />
          <stop offset="40%" stopColor="#D4B45A" />
          <stop offset="80%" stopColor="#A8862E" />
          <stop offset="100%" stopColor="#5A4515" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="30%" cy="25%" r="40%">
          <stop offset="0%" stopColor="#FFF8DC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFF8DC" stopOpacity="0" />
        </radialGradient>
        <path id={`${id}-arc-top`} d="M 30,110 A 80,80 0 0 1 190,110" fill="none" />
        <path id={`${id}-arc-bot`} d="M 30,110 A 80,80 0 0 0 190,110" fill="none" />
      </defs>

      {/* Disque or */}
      <circle cx="110" cy="110" r="100" fill={`url(#${id}-gold)`} stroke="#5A4515" strokeWidth="1.5" />
      <circle cx="110" cy="110" r="100" fill={`url(#${id}-shine)`} />
      <circle cx="110" cy="110" r="92" fill="none" stroke="#8C7A2E" strokeWidth="0.8" opacity="0.6" />

      {/* Texte haut */}
      <text
        fontFamily="Cinzel, serif"
        fontSize="13"
        fontWeight="600"
        fill="#5A4515"
        letterSpacing="3"
      >
        <textPath href={`#${id}-arc-top`} startOffset="50%" textAnchor="middle">
          IMPERIO GALLORUM SOCIATIS
        </textPath>
      </text>
      <text
        fontFamily="Cinzel, serif"
        fontSize="11"
        fontWeight="600"
        fill="#5A4515"
        letterSpacing="3"
      >
        <textPath href={`#${id}-arc-bot`} startOffset="50%" textAnchor="middle">
          PRIMUM NON NOCERE
        </textPath>
      </text>

      {/* Étoiles */}
      <g fill="#5A4515">
        <polygon points="22,110 26,106 30,110 26,114" />
        <polygon points="190,110 194,106 198,110 194,114" />
      </g>

      {/* Symbole central : croix tréflée stylisée */}
      <g transform="translate(110,108)" fill="#5A4515">
        <path d="M 0,-32 C -6,-26 -6,-22 0,-18 C 6,-22 6,-26 0,-32 Z" />
        <path d="M 0,32 C -6,26 -6,22 0,18 C 6,22 6,26 0,32 Z" />
        <path d="M -32,0 C -26,-6 -22,-6 -18,0 C -22,6 -26,6 -32,0 Z" />
        <path d="M 32,0 C 26,-6 22,-6 18,0 C 22,6 26,6 32,0 Z" />
        <circle cx="0" cy="0" r="6" />
      </g>

      {/* Mention 100 GALLIBRA */}
      <text
        x="110"
        y="158"
        textAnchor="middle"
        fontFamily="Cinzel, serif"
        fontSize="14"
        fontWeight="700"
        fill="#3D2E0A"
        letterSpacing="2"
      >
        100 GALLIBRA
      </text>
    </svg>
  )
}
