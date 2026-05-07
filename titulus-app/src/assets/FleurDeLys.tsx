type Props = {
  size?: number
  className?: string
  color?: string
}

export default function FleurDeLys({ size = 24, className = '', color = '#C9A84C' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Fleur de lys"
      fill={color}
    >
      <path d="M 16,2 C 13,7 11,12 13,16 C 9,13 5,15 5,19 C 5,23 9,25 13,23 L 13,28 C 9,28 7,29 7,30 L 25,30 C 25,29 23,28 19,28 L 19,23 C 23,25 27,23 27,19 C 27,15 23,13 19,16 C 21,12 19,7 16,2 Z M 8,19 L 24,19 L 23,22 L 9,22 Z" />
    </svg>
  )
}
