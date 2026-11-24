import { useCallback, useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import ErrorText from '../components/ErrorText'
import Spinner from '../components/Spinner'
import Toast from '../components/Toast'
import { useAuth } from '../lib/auth-context'
import { today } from '../lib/dates'
import { friendlyError } from '../lib/errors'
import { LOG_META, nextWateringDay } from '../lib/plant'
import { supabase } from '../lib/supabase'
import type { Plant as PlantT, PlantLog, PlantLogKind, PlantPhoto } from '../lib/types'
import DailyActions from './plant/DailyActions'
import GrowthGallery from './plant/GrowthGallery'
import PlantCalendar from './plant/PlantCalendar'
import PlantForm from './plant/PlantForm'
import PlantHeader from './plant/PlantHeader'
import PlantSetup from './plant/PlantSetup'
import WateringNotice from './plant/WateringNotice'

export default function Plant() {
  const { session } = useAuth()
  const userId = session?.user.id
  const [plant, setPlant] = useState<PlantT | null>(null)
  const [logs, setLogs] = useState<PlantLog[]>([])
  const [photos, setPhotos] = useState<PlantPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const clearToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (!userId) return
    let active = true
    ;(async () => {
      const { data: p, error: e1 } = await supabase.from('plants').select('*').eq('owner_id', userId).maybeSingle<PlantT>()
      if (!active) return
      if (e1) {
        setError(friendlyError(e1))
        return setLoading(false)
      }
      setPlant(p)
      if (p) {
        const [l, ph] = await Promise.all([
          supabase.from('plant_logs').select('*').eq('plant_id', p.id).order('created_at'),
          supabase.from('plant_photos').select('*').eq('plant_id', p.id).order('taken_on', { ascending: false }),
        ])
        if (!active) return
        if (l.error || ph.error) setError(friendlyError(l.error ?? ph.error))
        setLogs((l.data as PlantLog[]) ?? [])
        setPhotos((ph.data as PlantPhoto[]) ?? [])
      }
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [userId])

  const nextWatering = useMemo(
    () => (plant ? nextWateringDay(logs, plant.water_every_days) : today()),
    [logs, plant],
  )

  const addLog = useCallback(
    async (kind: PlantLogKind, note?: string) => {
      if (!plant) return false
      const { data, error } = await supabase
        .from('plant_logs')
        .insert({ plant_id: plant.id, kind, note: note ?? null, day: today() })
        .select()
        .single<PlantLog>()
      if (error) {
        setToast(friendlyError(error))
        return false
      }
      setLogs((prev) => [...prev, data])
      setToast(`${LOG_META[kind].emoji} ${LOG_META[kind].done}`)
      return true
    },
    [plant],
  )

  if (loading) return <Spinner label="Buscando a tu planta…" />
  if (!plant) return error ? <ErrorText>{error}</ErrorText> : <PlantSetup onCreated={setPlant} />

  return (
    <div className="flex flex-col gap-6">
      {editing ? (
        <Card>
          <h1 className="mb-4 font-display text-3xl font-semibold">Editar planta</h1>
          <PlantForm
            plant={plant}
            onSaved={(p) => {
              setPlant(p)
              setEditing(false)
              setToast('Cambios guardados 🌿')
            }}
            onCancel={() => setEditing(false)}
          />
        </Card>
      ) : (
        <PlantHeader plant={plant} onEdit={() => setEditing(true)} />
      )}
      <ErrorText>{error}</ErrorText>
      <WateringNotice plantName={plant.name} nextDay={nextWatering} />
      <DailyActions onLog={addLog} />
      <PlantCalendar logs={logs} nextWatering={nextWatering} />
      <GrowthGallery
        plant={plant}
        photos={photos}
        onAdded={(ph) => setPhotos((prev) => [ph, ...prev].sort((a, b) => b.taken_on.localeCompare(a.taken_on)))}
        onShared={() => setToast('¡Compartida en la comunidad! 🌱')}
      />
      <Toast message={toast} onDone={clearToast} />
    </div>
  )
}
