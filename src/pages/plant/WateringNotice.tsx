import { daysUntil } from '../../lib/plant'
import { formatDay } from '../../lib/dates'

export default function WateringNotice({ plantName, nextDay }: { plantName: string; nextDay: string }) {
  const days = daysUntil(nextDay)
  const due = days <= 0
  return (
    <div className={`rounded-2xl p-4 ${due ? 'bg-sage/40' : 'bg-mist'}`} role="status">
      {due ? (
        <p className="text-lg font-semibold">💧 Hoy toca regar a {plantName}</p>
      ) : (
        <p>
          <span className="font-semibold">Próximo riego:</span> {formatDay(nextDay, "EEEE d 'de' MMMM")}{' '}
          <span className="text-bark">(en {days} {days === 1 ? 'día' : 'días'})</span>
        </p>
      )}
    </div>
  )
}
