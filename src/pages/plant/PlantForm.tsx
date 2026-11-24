import { useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import ErrorText from '../../components/ErrorText'
import Field from '../../components/Field'
import PhotoInput from '../../components/PhotoInput'
import SelectField from '../../components/SelectField'
import { useAuth } from '../../lib/auth-context'
import { friendlyError } from '../../lib/errors'
import { PLANT_TYPES } from '../../lib/plant'
import { supabase } from '../../lib/supabase'
import type { Plant } from '../../lib/types'
import { uploadImage } from '../../lib/upload'

interface PlantFormProps {
  plant?: Plant
  onSaved: (plant: Plant) => void
  onCancel?: () => void
}

export default function PlantForm({ plant, onSaved, onCancel }: PlantFormProps) {
  const { session } = useAuth()
  const [name, setName] = useState(plant?.name ?? '')
  const [type, setType] = useState(plant?.type ?? PLANT_TYPES[0])
  const [every, setEvery] = useState(plant?.water_every_days ?? 10)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!session) return
    setSaving(true)
    setError(null)
    try {
      const photo_url = file ? await uploadImage(file, session.user.id, 'plant') : (plant?.photo_url ?? null)
      const values = { name: name.trim(), type, water_every_days: every, photo_url }
      const query = plant
        ? supabase.from('plants').update(values).eq('id', plant.id)
        : supabase.from('plants').insert(values)
      const { data, error } = await query.select().single<Plant>()
      if (error) throw new Error(friendlyError(error))
      onSaved(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="¿Cómo se llama tu planta?" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Pepita" />
      <SelectField label="Tipo" options={PLANT_TYPES} value={type} onChange={(e) => setType(e.target.value)} />
      <Field
        label="Regar cada (días)"
        type="number"
        inputMode="numeric"
        min={1}
        max={60}
        required
        value={every}
        onChange={(e) => setEvery(Number(e.target.value))}
        hint="Las suculentas suelen regarse cada 7 a 14 días."
      />
      <PhotoInput label="Foto" file={file} onChange={setFile} currentUrl={plant?.photo_url} />
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" loading={saving} className="flex-1">
          {plant ? 'Guardar cambios' : 'Empezar a cuidarla 🌱'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
