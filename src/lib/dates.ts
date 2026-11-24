import { format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/** Fecha LOCAL en yyyy-MM-dd. Nunca usar current_date de Postgres (UTC). */
export const toDay = (date: Date) => format(date, 'yyyy-MM-dd')
export const today = () => toDay(new Date())

/** Parsea un `date` de Postgres (yyyy-MM-dd) como fecha local. */
export const fromDay = (day: string) => parseISO(day)

export const formatDay = (day: string, pattern = "d 'de' MMM") =>
  format(fromDay(day), pattern, { locale: es })

export const timeAgo = (iso: string) =>
  formatDistanceToNowStrict(new Date(iso), { locale: es, addSuffix: true })
