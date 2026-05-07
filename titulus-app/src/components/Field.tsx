/**
 * Champ de formulaire impérial : label + input + erreur éventuelle.
 */
import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '../utils/cn'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export default function Field({ label, error, hint, className, id, ...rest }: Props) {
  const reactId = useId()
  const fieldId = id ?? `fld-${reactId}`
  return (
    <div className={cn('w-full', className)}>
      <label htmlFor={fieldId} className="imperial-label">
        {label}
        {rest.required && <span aria-hidden className="text-cardinal ml-1">*</span>}
      </label>
      <input
        id={fieldId}
        className={cn(
          'imperial-input',
          error && 'border-cardinal focus:border-cardinal focus:ring-cardinal',
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...rest}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-xs text-texte-muet font-sans">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-cardinal font-sans">
          {error}
        </p>
      )}
    </div>
  )
}
