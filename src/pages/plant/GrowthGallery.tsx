import { Share2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ErrorText from '../../components/ErrorText'
import Field from '../../components/Field'
import PhotoInput from '../../components/PhotoInput'
import { useAuth } from '../../lib/auth-context'
import { formatDay, today } from '../../lib/dates'
import { friendlyError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import type { Plant, PlantPhoto } from '../../lib/types'
import { uploadImage } from '../../lib/upload'

interface GrowthGalleryProps {
  plant: Plant
  photos: PlantPhoto[]
  onAdded: (photo: PlantPhoto) => void
  onShared: () => void
}

export default function GrowthGallery({ plant, photos, onAdded, onShared }: GrowthGalleryProps) {
  const { session } = useAuth()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [takenOn, setTakenOn] = useState(today())
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!file || !session) return setError('Elige una foto primero.')
    setSaving(true)
    setError(null)
    try {
      const url = await uploadImage(file, session.user.id, 'plant')
      const { data, error } = await supabase
        .from('plant_photos')
        .insert({ plant_id: plant.id, url, taken_on: takenOn })
        .select()
        .single<PlantPhoto>()
      if (error) throw new Error(friendlyError(error))
      onAdded(data)
      setFile(null)
      setTakenOn(today())
      setOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal.')
    } finally {
      setSaving(false)
    }
  }

  async function share(photo: PlantPhoto) {
    setSharing(photo.id)
    setError(null)
    const { error } = await supabase
      .from('posts')
      .insert({ image_url: photo.url, caption: `${plant.name} · ${formatDay(photo.taken_on)} 🌱` })
    setSharing(null)
    if (error) return setError(friendlyError(error))
    onShared()
  }

  return (
    <section aria-labelledby="gallery-title" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 id="gallery-title" className="font-display text-2xl font-semibold">
          Cómo ha crecido
        </h2>
        <Button variant="secondary" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Cerrar' : 'Agregar foto'}
        </Button>
      </div>

      {open && (
        <Card>
          <form onSubmit={add} className="flex flex-col gap-4">
            <PhotoInput label="Foto" file={file} onChange={setFile} />
            <Field label="Fecha" type="date" max={today()} required value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
            <Button type="submit" loading={saving}>Guardar foto</Button>
          </form>
        </Card>
      )}
      <ErrorText>{error}</ErrorText>

      {photos.length === 0 ? (
        <p className="rounded-2xl bg-mist/60 p-6 text-center text-bark">
          Aún no hay fotos. ¡Guarda la primera para ver cómo crece! 📸
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="overflow-hidden rounded-2xl border border-clay/40 bg-white/70">
              <img src={photo.url} alt={`${plant.name} el ${formatDay(photo.taken_on)}`} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-1 px-3 py-2">
                <span className="text-sm text-bark">{formatDay(photo.taken_on)}</span>
                <button
                  type="button"
                  onClick={() => share(photo)}
                  disabled={sharing !== null}
                  aria-label="Compartir en comunidad"
                  title="Compartir en comunidad"
                  className="grid size-11 place-items-center rounded-full text-moss hover:bg-mist disabled:opacity-50"
                >
                  <Share2 size={18} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
