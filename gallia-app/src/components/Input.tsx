import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import cn from '../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, className, id: idProp, ...props }, ref) => {
    const generatedId = useId()
    const id = idProp ?? generatedId

    return (
      <div className="relative w-full">
        {/* Floating label container */}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            required={required}
            placeholder=" "
            className={cn(
              'peer w-full font-body text-noir bg-blanc',
              'border border-gris rounded-sm px-4 pt-6 pb-2',
              'transition-colors duration-200',
              'placeholder-shown:pt-4 placeholder-shown:pb-4',
              'focus:outline-none focus:border-noir focus:ring-1 focus:ring-noir',
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
              'disabled:bg-gris-clair disabled:cursor-not-allowed',
              className as string
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />

          {/* Floating label */}
          <label
            htmlFor={id}
            className={cn(
              'absolute left-4 font-body text-gris-texte pointer-events-none',
              'transition-all duration-200 origin-left',
              // Floated state (when input has content or is focused)
              'top-2 text-xs scale-100',
              // Non-floated state via peer
              'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gris-texte',
              // Focus state
              'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs',
              error ? 'text-red-500' : 'peer-focus:text-noir'
            )}
          >
            {label}
            {required && <span className="ml-0.5 text-or" aria-hidden="true">*</span>}
          </label>
        </div>

        {/* Error message */}
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-xs font-body text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p id={`${id}-helper`} className="mt-1.5 text-xs font-body text-gris-texte">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
