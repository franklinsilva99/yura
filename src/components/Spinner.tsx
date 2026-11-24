export default function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-12 text-bark">
      <span className="size-8 animate-spin rounded-full border-2 border-mist border-t-moss" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
