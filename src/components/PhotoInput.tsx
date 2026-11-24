import { Camera } from 'lucide-react'
import { useEffect, useId, useMemo } from 'react'

interface PhotoInputProps {
  label: string
  file: File | null
  onChange: (file: File | null) => void
  currentUrl?: string | null
}

export default function PhotoInput({ label, file, onChange, currentUrl }: PhotoInputProps) {
  const id = useId()
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const shown = preview ?? currentUrl
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-clay bg-white/60 p-3 hover:bg-mist/50 focus-within:outline-2 focus-within:outline-moss"
      >
        {shown ? (
          <img src={shown} alt="Vista previa" className="size-16 rounded-xl object-cover" />
        ) : (
          <span className="grid size-16 place-items-center rounded-xl bg-mist text-moss">
            <Camera aria-hidden />
          </span>
        )}
        <span className="text-sm text-bark">{file ? file.name : 'Toca para elegir una foto'}</span>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  )
}
