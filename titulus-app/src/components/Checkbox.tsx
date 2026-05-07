/**
 * Case de consentement à coche or.
 */
import { useId } from 'react'
import type { ReactNode } from 'react'

type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  children: ReactNode
  required?: boolean
  id?: string
  disabled?: boolean
}

export default function Checkbox({ checked, onChange, children, required, id, disabled }: Props) {
  const reactId = useId()
  const cid = id ?? `chk-${reactId}`
  return (
    <label
      htmlFor={cid}
      className={
        'flex gap-3 items-start cursor-pointer group ' +
        (disabled ? 'opacity-60 cursor-not-allowed' : '')
      }
    >
      <input
        id={cid}
        type="checkbox"
        checked={checked}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="imperial-checkbox"
      />
      <span className="font-cormorant text-base leading-relaxed text-texte-clair group-hover:text-or-pale transition-colors">
        {children}
      </span>
    </label>
  )
}
