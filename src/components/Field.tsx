import { useId, type InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}

export default function Field({ label, hint, className = '', ...rest }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hintId}
        className="min-h-11 w-full rounded-xl border border-clay/60 bg-white/80 px-3 placeholder:text-bark/60 focus:border-moss focus:outline-none"
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-bark">
          {hint}
        </p>
      )}
    </div>
  )
}
