import { addDays, differenceInCalendarDays } from 'date-fns'
import { fromDay, today, toDay } from './dates'
import type { PlantLog, PlantLogKind } from './types'

export const PLANT_TYPES = ['Suculenta', 'Echeveria', 'Haworthia', 'Aloe', 'Crassula', 'Sedum', 'Cactus', 'Otra'] as const

export const LOG_META: Record<PlantLogKind, { emoji: string; label: string; done: string }> = {
  regue: { emoji: '💧', label: 'La regué', done: '¡Riego registrado!' },
  sol: { emoji: '☀️', label: 'La puse al sol', done: '¡Qué rico solecito!' },
  hable: { emoji: '💬', label: 'Le hablé', done: 'Seguro le gustó escucharte' },
  nota: { emoji: '📝', label: 'Nota', done: 'Nota guardada' },
}

export const LOG_ORDER: PlantLogKind[] = ['regue', 'sol', 'hable', 'nota']

/** Próximo riego = último 'regue' + frecuencia; si nunca se regó, hoy. */
export function nextWateringDay(logs: PlantLog[], everyDays: number): string {
  const last = logs
    .filter((l) => l.kind === 'regue')
    .reduce<string | null>((max, l) => (max === null || l.day > max ? l.day : max), null)
  return last ? toDay(addDays(fromDay(last), everyDays)) : today()
}

export function daysUntil(day: string): number {
  return differenceInCalendarDays(fromDay(day), fromDay(today()))
}
