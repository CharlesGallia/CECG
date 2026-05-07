/**
 * Armoiries IGS flottantes — composant visuel pour le top des pages.
 *
 * Reproduit le grand blason fourni par le Premier Consul : couronne impériale,
 * sceptres croisés, drapé noir + or à bordure tressée et glands de soie,
 * écu noir frappé de la fleur de lys gardée par deux lions et de l'abeille
 * impériale, drapé inférieur or à semis de fleurs de lys.
 *
 * Si `public/assets/armoiries-igs.png` existe, il est chargé en priorité
 * et le SVG inline sert de fallback. Animation : douce flottaison verticale.
 */
import { useState } from 'react'
import { cn } from '../utils/cn'

type Props = {
  size?: number
  className?: string
  src?: string
}

export default function ArmoriesFloating({ size = 360, className, src = '/assets/armoiries-igs.png' }: Props) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn(
        'pointer-events-none select-none',
        'animate-armoiries-float',
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {!failed ? (
        <img
          src={src}
          width={size}
          height={size}
          alt=""
          className="w-full h-full object-contain drop-shadow-[0_30px_60px_rgba(201,168,76,0.25)]"
          onError={() => setFailed(true)}
        />
      ) : (
        <ArmoriesFallbackSvg size={size} />
      )}
    </div>
  )
}

function ArmoriesFallbackSvg({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 360 360"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_30px_60px_rgba(201,168,76,0.25)]"
    >
      <defs>
        <linearGradient id="arm-or" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E5A8" />
          <stop offset="50%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8C7A2E" />
        </linearGradient>
        <linearGradient id="arm-velvet" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <radialGradient id="arm-shield" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>

      {/* Couronne impériale */}
      <g transform="translate(180,55)" fill="url(#arm-or)">
        <path d="M -50,28 L -45,-2 L -30,12 L -15,-12 L 0,8 L 15,-12 L 30,12 L 45,-2 L 50,28 Z" />
        <rect x="-52" y="28" width="104" height="8" rx="1" />
        <circle cx="-45" cy="-4" r="3" />
        <circle cx="-15" cy="-14" r="3" />
        <circle cx="0" cy="6" r="3" />
        <circle cx="15" cy="-14" r="3" />
        <circle cx="45" cy="-4" r="3" />
        {/* Croix sommitale */}
        <rect x="-1.5" y="-32" width="3" height="14" />
        <rect x="-7" y="-26" width="14" height="3" />
      </g>

      {/* Sceptres croisés */}
      <g stroke="url(#arm-or)" strokeWidth="3" fill="url(#arm-or)">
        <line x1="105" y1="80" x2="170" y2="160" />
        <line x1="255" y1="80" x2="190" y2="160" />
        <circle cx="105" cy="80" r="8" />
        <circle cx="255" cy="80" r="8" />
      </g>

      {/* Drapé velours noir */}
      <path
        d="M 80,90 Q 60,140 70,200 L 90,210 Q 90,150 110,120 Z"
        fill="url(#arm-velvet)"
        stroke="url(#arm-or)"
        strokeWidth="1.5"
      />
      <path
        d="M 280,90 Q 300,140 290,200 L 270,210 Q 270,150 250,120 Z"
        fill="url(#arm-velvet)"
        stroke="url(#arm-or)"
        strokeWidth="1.5"
      />

      {/* Glands de soie */}
      <g fill="url(#arm-or)">
        <circle cx="78" cy="180" r="6" />
        <path d="M 75,180 L 73,200 L 82,200 L 80,180 Z" />
        <circle cx="282" cy="180" r="6" />
        <path d="M 279,180 L 277,200 L 286,200 L 284,180 Z" />
      </g>

      {/* Écu central */}
      <path
        d="M 130,110 L 230,110 L 230,200 Q 230,250 180,275 Q 130,250 130,200 Z"
        fill="url(#arm-shield)"
        stroke="url(#arm-or)"
        strokeWidth="3"
      />
      {/* Bordure tressée */}
      <path
        d="M 130,110 L 230,110 L 230,200 Q 230,250 180,275 Q 130,250 130,200 Z"
        fill="none"
        stroke="url(#arm-or)"
        strokeWidth="1"
        strokeDasharray="4 2"
        opacity="0.6"
      />

      {/* Fleur de lys centrale + lions */}
      <g transform="translate(180,180)" fill="url(#arm-or)">
        {/* Fleur de lys */}
        <path d="M 0,-40 C -7,-30 -10,-20 -6,-12 C -12,-16 -18,-14 -18,-6 C -18,2 -10,8 0,4 L 0,18 C -8,18 -14,24 -14,30 C -14,36 -8,40 0,36 L 0,42 L 4,42 L 4,36 C 12,40 18,36 18,30 C 18,24 12,18 4,18 L 4,4 C 14,8 22,2 22,-6 C 22,-14 16,-16 10,-12 C 14,-20 11,-30 0,-40 Z" />
        <path d="M -18,4 L 18,4 L 16,10 L -16,10 Z" />

        {/* Lion gauche */}
        <g transform="translate(-32,5)">
          <ellipse cx="0" cy="0" rx="14" ry="10" />
          <circle cx="-6" cy="-2" r="2" fill="#000" />
          <path d="M -10,-12 L -6,-6 M -2,-14 L 0,-6 M 4,-12 L 6,-6" stroke="url(#arm-or)" strokeWidth="1.5" />
          <path d="M 8,-2 L 18,2 L 14,8 L 8,4 Z" />
        </g>
        {/* Lion droit (miroir) */}
        <g transform="translate(32,5) scale(-1,1)">
          <ellipse cx="0" cy="0" rx="14" ry="10" />
          <circle cx="-6" cy="-2" r="2" fill="#000" />
          <path d="M -10,-12 L -6,-6 M -2,-14 L 0,-6 M 4,-12 L 6,-6" stroke="url(#arm-or)" strokeWidth="1.5" />
          <path d="M 8,-2 L 18,2 L 14,8 L 8,4 Z" />
        </g>
      </g>

      {/* Abeille impériale */}
      <g transform="translate(180,235)" fill="url(#arm-or)">
        <ellipse cx="0" cy="0" rx="10" ry="14" />
        <ellipse cx="-12" cy="-6" rx="7" ry="4" opacity="0.6" />
        <ellipse cx="12" cy="-6" rx="7" ry="4" opacity="0.6" />
        <path d="M -5,-6 L 5,-6 M -5,-2 L 5,-2 M -5,2 L 5,2 M -5,6 L 5,6" stroke="#000" strokeWidth="1" />
      </g>

      {/* Drapé inférieur or à fleurs de lys */}
      <g>
        <path
          d="M 110,260 Q 130,320 180,330 Q 230,320 250,260 L 240,265 Q 220,310 180,318 Q 140,310 120,265 Z"
          fill="url(#arm-or)"
        />
        {/* Semis de mini-fleurs de lys */}
        {[
          [150, 290], [180, 305], [210, 290],
          [165, 280], [195, 280],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#5A4515" />
        ))}
      </g>
    </svg>
  )
}
