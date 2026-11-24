import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import { addDays, addWeeks, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import Card from '../../components/Card'
import ErrorText from '../../components/ErrorText'
import { today, toDay } from '../../lib/dates'
import { friendlyError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import type { Wellbeing } from '../../lib/types'
import { SCORE } from '../../lib/wellbeing'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const Y_LABELS: Record<number, string> = { 1: 'Difícil', 2: 'Regular', 3: 'Bien', 4: 'Muy bien' }

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  spanGaps: false,
  interaction: { mode: 'index', intersect: false },
  scales: {
    y: {
      min: 1,
      max: 4,
      ticks: { stepSize: 1, callback: (v) => Y_LABELS[Number(v)] ?? '', color: '#8C7A66' },
      grid: { color: '#DCE5DD' },
    },
    x: { ticks: { color: '#8C7A66' }, grid: { display: false } },
  },
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, color: '#2F4A3D', font: { family: 'Nunito' } } },
  },
}

export default function WeeklyChart({ refreshKey }: { refreshKey: number }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [rows, setRows] = useState<Wellbeing[]>([])
  const [error, setError] = useState<string | null>(null)
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => toDay(addDays(weekStart, i))), [weekStart])
  const [todayStr] = useState(today)
  const isCurrentWeek = days.includes(todayStr)

  useEffect(() => {
    let active = true
    supabase
      .from('wellbeing')
      .select('*')
      .gte('day', days[0])
      .lte('day', days[6])
      .then(({ data, error }) => {
        if (!active) return
        setError(error ? friendlyError(error) : null)
        setRows((data as Wellbeing[]) ?? [])
      })
    return () => {
      active = false
    }
  }, [days, refreshKey])

  const data = useMemo(() => {
    const byDay = new Map(rows.map((r) => [r.day, r]))
    const series = (label: string, color: string, pick: (w: Wellbeing) => number | null) => ({
      label,
      data: days.map((d) => {
        const w = byDay.get(d)
        return w ? pick(w) : null
      }),
      borderColor: color,
      backgroundColor: color,
      tension: 0.35,
      pointRadius: 4,
    })
    return {
      labels: days.map((d) => format(new Date(`${d}T00:00`), 'EEE d', { locale: es })),
      datasets: [
        series('Ánimo', '#2F4A3D', (w) => (w.mood ? SCORE.mood[w.mood] : null)),
        series('Sueño', '#5E7D69', (w) => (w.sleep ? SCORE.sleep[w.sleep] : null)),
        series('Comida', '#BFAE9A', (w) => (w.food ? SCORE.food[w.food] : null)),
        series('Estudios', '#8FA996', (w) => (w.study ? SCORE.study[w.study] : null)),
      ],
    }
  }, [rows, days])

  const count = rows.length
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" aria-label="Semana anterior" onClick={() => setWeekStart((w) => addWeeks(w, -1))} className="grid size-11 place-items-center rounded-full hover:bg-mist">
          <ChevronLeft aria-hidden />
        </button>
        <h2 className="text-center font-display text-2xl font-semibold">
          {isCurrentWeek ? 'Así te has sentido esta semana' : `Semana del ${format(weekStart, "d 'de' MMM", { locale: es })}`}
        </h2>
        <button type="button" aria-label="Semana siguiente" disabled={isCurrentWeek} onClick={() => setWeekStart((w) => addWeeks(w, 1))} className="grid size-11 place-items-center rounded-full hover:bg-mist disabled:opacity-30">
          <ChevronRight aria-hidden />
        </button>
      </div>
      <ErrorText>{error}</ErrorText>
      <div className="h-64" role="img" aria-label={`Gráfico de ánimo, sueño, comida y estudios. ${count} días registrados.`}>
        <Line data={data} options={options} />
      </div>
      <p className="mt-3 text-center text-bark">
        {count === 0
          ? 'Esta semana aún no hay registros. Cuando quieras, aquí estaremos 🌱'
          : `${isCurrentWeek ? 'Esta semana' : 'Esa semana'} registraste ${count} ${count === 1 ? 'día' : 'días'} 🌿`}
      </p>
    </Card>
  )
}
