export interface Choice<T extends string> {
  value: T
  label: string
}

interface ChoiceGroupProps<T extends string> {
  legend: string
  options: Choice<T>[]
  value: T | null
  onChange: (value: T) => void
  disabled?: boolean
}

export default function ChoiceGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  disabled,
}: ChoiceGroupProps<T>) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.value)}
              className={`min-h-11 rounded-full border px-4 transition-colors ${
                selected
                  ? 'border-moss bg-sage text-white'
                  : 'border-clay/50 bg-mist/60 text-forest hover:bg-mist'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
