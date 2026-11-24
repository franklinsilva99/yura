import { useId, type SelectHTMLAttributes } from 'react'

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: readonly string[]
}

export default function SelectField({ label, options, className = '', ...rest }: SelectFieldProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        className="min-h-11 w-full rounded-xl border border-clay/60 bg-white/80 px-3 focus:border-moss focus:outline-none"
        {...rest}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}
