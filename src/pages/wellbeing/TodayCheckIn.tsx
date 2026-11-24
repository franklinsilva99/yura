import { useState } from 'react'
import Card from '../../components/Card'
import ChoiceGroup from '../../components/ChoiceGroup'
import ErrorText from '../../components/ErrorText'
import { today } from '../../lib/dates'
import { friendlyError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import type { Wellbeing } from '../../lib/types'
import { FOOD, MOOD, SLEEP, STUDY } from '../../lib/wellbeing'

type Fields = Pick<Wellbeing, 'mood' | 'sleep' | 'food' | 'study'>

interface TodayCheckInProps {
  entry: Wellbeing | null
  onSaved: (entry: Wellbeing) => void
}

export default function TodayCheckIn({ entry, onSaved }: TodayCheckInProps) {
  const [values, setValues] = useState<Fields>({
    mood: entry?.mood ?? null,
    sleep: entry?.sleep ?? null,
    food: entry?.food ?? null,
    study: entry?.study ?? null,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function update<K extends keyof Fields>(key: K, value: Fields[K]) {
    const next = { ...values, [key]: value }
    setValues(next)
    setSaving(true)
    setSaved(false)
    setError(null)
    const { data, error } = await supabase
      .from('wellbeing')
      .upsert({ day: today(), ...next, updated_at: new Date().toISOString() }, { onConflict: 'user_id,day' })
      .select()
      .single<Wellbeing>()
    setSaving(false)
    if (error) return setError(friendlyError(error))
    setSaved(true)
    onSaved(data)
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-semibold">¿Cómo estás hoy?</h2>
        <span className="text-sm text-bark" aria-live="polite">
          {saving ? 'Guardando…' : saved ? 'Guardado ✓' : ''}
        </span>
      </div>
      <ChoiceGroup legend="¿Cómo te sientes hoy?" options={MOOD} value={values.mood} onChange={(v) => update('mood', v)} />
      <ChoiceGroup legend="¿Cómo dormiste?" options={SLEEP} value={values.sleep} onChange={(v) => update('sleep', v)} />
      <ChoiceGroup legend="¿Cómo comiste?" options={FOOD} value={values.food} onChange={(v) => update('food', v)} />
      <ChoiceGroup legend="¿Cómo van tus estudios?" options={STUDY} value={values.study} onChange={(v) => update('study', v)} />
      <ErrorText>{error}</ErrorText>
      <p className="text-sm text-bark">Puedes cambiar tus respuestas durante todo el día.</p>
    </Card>
  )
}
