import type { HTMLAttributes, ReactNode } from 'react'
import cn from '../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Ajoute une bordure or sur le côté gauche */
  accent?: boolean
  /** Ajoute une bordure complète or */
  bordered?: boolean
  /** Padding interne */
  padding?: 'sm' | 'md' | 'lg'
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({
  children,
  accent = false,
  bordered = false,
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-blanc rounded-sm',
        'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
        bordered ? 'border border-or' : 'border border-gris',
        accent ? 'border-l-2 border-l-or' : '',
        paddingClasses[padding],
        className as string
      )}
      {...props}
    >
      {children}
    </div>
  )
}
