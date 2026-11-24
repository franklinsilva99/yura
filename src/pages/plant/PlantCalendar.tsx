import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import Card from '../../components/Card'
import { formatDay, today, toDay } from '../../lib/dates'
import { LOG_META } from '../../lib/plant'
import type { PlantLog } from '../../lib/types'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

interface PlantCalendarProps {
  logs: PlantLog[]
  nextWatering: string
}

export default function PlantCalendar({ logs, nextWatering }: PlantCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<string>(today())
  const todayStr = today()

  const byDay = useMemo(() => {
    const map = new Map<string, PlantLog[]>()
    for (const log of logs) map.set(log.day, [...(map.get(log.day) ?? []), log])
    return map
  }, [logs])

  const days = eachDayOfInterval({
    start: startOfWeek(month, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  })
  const selectedLogs = byDay.get(selected) ?? []

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <button type="button" aria-label="Mes anterior" onClick={() => setMonth((m) => addMonths(m, -1))} className="grid size-11 place-items-center rounded-full hover:bg-mist">
          <ChevronLeft aria-hidden />
        </button>
        <h2 className="font-display text-2xl font-semibold capitalize">
          {format(month, 'MMMM yyyy', { locale: es })}
        </h2>
        <button type="button" aria-label="Mes siguiente" onClick={() => setMonth((m) => addMonths(m, 1))} className="grid size-11 place-items-center rounded-full hover:bg-mist">
          <ChevronRight aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-bark" aria-hidden>
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date) => {
          const day = toDay(date)
          const dayLogs = byDay.get(day) ?? []
          const kinds = [...new Set(dayLogs.map((l) => l.kind))]
          const inMonth = isSameMonth(date, month)
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelected(day)}
              aria-pressed={selected === day}
              aria-label={`${formatDay(day, "d 'de' MMMM")}${dayLogs.length ? `, ${dayLogs.length} registros` : ''}${day === nextWatering ? ', próximo riego' : ''}`}
              className={`flex aspect-square flex-col items-center justify-start rounded-xl p-1 text-sm transition-colors ${
                inMonth ? '' : 'opacity-35'
              } ${selected === day ? 'bg-mist' : 'hover:bg-mist/50'} ${
                day === nextWatering ? 'border-2 border-dashed border-moss' : 'border border-transparent'
              }`}
            >
              <span className={day === todayStr ? 'rounded-full bg-forest px-1.5 font-semibold text-sand' : ''}>
                {date.getDate()}
              </span>
              <span className="text-[10px] leading-tight md:text-xs" aria-hidden>
                {kinds.map((k) => LOG_META[k].emoji).join('')}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 border-t border-clay/40 pt-3">
        <h3 className="font-semibold capitalize">{formatDay(selected, "EEEE d 'de' MMMM")}</h3>
        {selectedLogs.length === 0 ? (
          <p className="text-sm text-bark">Sin registros este día.</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {selectedLogs.map((l) => (
              <li key={l.id}>
                {LOG_META[l.kind].emoji} {l.kind === 'nota' ? l.note : LOG_META[l.kind].label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
