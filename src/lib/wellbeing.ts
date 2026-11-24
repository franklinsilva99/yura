import { differenceInCalendarDays } from 'date-fns'
import type { Choice } from '../components/ChoiceGroup'
import { fromDay } from './dates'
import type { Food, Mood, Sleep, Study, Wellbeing } from './types'

export const MOOD: Choice<Mood>[] = [
  { value: 'muy_bien', label: 'Muy bien' },
  { value: 'bien', label: 'Bien' },
  { value: 'regular', label: 'Regular' },
  { value: 'mal', label: 'Mal' },
]
export const SLEEP: Choice<Sleep>[] = [
  { value: 'excelente', label: 'Dormí excelente' },
  { value: 'bien', label: 'Dormí bien' },
  { value: 'mal', label: 'Dormí mal' },
  { value: 'no_dormi', label: 'No dormí' },
]
export const FOOD: Choice<Food>[] = [
  { value: 'bien', label: 'Comí bien' },
  { value: 'poco', label: 'Comí poco' },
  { value: 'no_comi', label: 'No comí' },
]
export const STUDY: Choice<Study>[] = [
  { value: 'muy_bien', label: 'Muy bien' },
  { value: 'bien', label: 'Bien' },
  { value: 'dificultad', label: 'Con dificultad' },
  { value: 'abruma', label: 'Me abruma' },
]

export const SCORE = {
  mood: { muy_bien: 4, bien: 3, regular: 2, mal: 1 } satisfies Record<Mood, number>,
  sleep: { excelente: 4, bien: 3, mal: 2, no_dormi: 1 } satisfies Record<Sleep, number>,
  food: { bien: 4, poco: 2.5, no_comi: 1 } satisfies Record<Food, number>,
  study: { muy_bien: 4, bien: 3, dificultad: 2, abruma: 1 } satisfies Record<Study, number>,
}

const isHeavy = (w: Wellbeing) => w.mood === 'mal' || w.sleep === 'no_dormi' || w.study === 'abruma'

/** Los 3 registros más recientes están en días consecutivos y cada uno es "pesado". */
export function needsSupport(recentDesc: Wellbeing[]): boolean {
  const [a, b, c] = recentDesc
  if (!a || !b || !c) return false
  const consecutive =
    differenceInCalendarDays(fromDay(a.day), fromDay(b.day)) === 1 &&
    differenceInCalendarDays(fromDay(b.day), fromDay(c.day)) === 1
  return consecutive && [a, b, c].every(isHeavy)
}
