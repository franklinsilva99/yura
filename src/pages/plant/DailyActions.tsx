import { useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import { LOG_META, LOG_ORDER } from '../../lib/plant'
import type { PlantLogKind } from '../../lib/types'

interface DailyActionsProps {
  onLog: (kind: PlantLogKind, note?: string) => Promise<boolean>
}

export default function DailyActions({ onLog }: DailyActionsProps) {
  const [busy, setBusy] = useState<PlantLogKind | null>(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')

  async function log(kind: PlantLogKind, text?: string) {
    setBusy(kind)
    const ok = await onLog(kind, text)
    setBusy(null)
    return ok
  }

  async function submitNote(e: FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    if (await log('nota', note.trim())) {
      setNote('')
      setNoteOpen(false)
    }
  }

  return (
    <section aria-labelledby="today-title">
      <h2 id="today-title" className="mb-3 font-display text-2xl font-semibold">
        Hoy con tu planta
      </h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {LOG_ORDER.map((kind) => (
          <button
            key={kind}
            type="button"
            disabled={busy !== null}
            aria-expanded={kind === 'nota' ? noteOpen : undefined}
            onClick={() => (kind === 'nota' ? setNoteOpen((o) => !o) : log(kind))}
            className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-clay/40 bg-white/70 font-semibold shadow-sm transition hover:bg-mist active:scale-95 disabled:opacity-60"
          >
            <span className="text-2xl" aria-hidden>
              {LOG_META[kind].emoji}
            </span>
            {busy === kind ? 'Guardando…' : LOG_META[kind].label}
          </button>
        ))}
      </div>
      {noteOpen && (
        <form onSubmit={submitNote} className="mt-3 flex flex-col gap-2">
          <label htmlFor="plant-note" className="text-sm font-semibold">
            ¿Qué quieres recordar de hoy?
          </label>
          <textarea
            id="plant-note"
            maxLength={500}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-xl border border-clay/60 bg-white/80 p-3 focus:border-moss focus:outline-none"
            placeholder="Le salió una hojita nueva…"
          />
          <Button type="submit" loading={busy === 'nota'} className="self-end">
            Guardar nota
          </Button>
        </form>
      )}
    </section>
  )
}
