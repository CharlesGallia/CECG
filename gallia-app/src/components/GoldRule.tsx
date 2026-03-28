import type { HTMLAttributes } from 'react'
import cn from '../utils/cn'

interface GoldRuleProps extends HTMLAttributes<HTMLHRElement> {
  /** Largeur en % ou px, ex: '100%' | '60px' */
  width?: string
  /** Épaisseur en px, ex: 1 | 2 */
  thickness?: number
  /** Centrer la ligne (utile si width < 100%) */
  centered?: boolean
}

export default function GoldRule({
  width = '100%',
  thickness = 1,
  centered = false,
  className,
  style,
  ...props
}: GoldRuleProps) {
  return (
    <hr
      className={cn(
        'border-0 bg-or shrink-0',
        centered ? 'mx-auto' : '',
        className as string
      )}
      style={{
        width,
        height: `${thickness}px`,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}
