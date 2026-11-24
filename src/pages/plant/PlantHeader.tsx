import { Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Plant } from '../../lib/types'

export default function PlantHeader({ plant, onEdit }: { plant: Plant; onEdit: () => void }) {
  return (
    <header className="flex items-center gap-5">
      <div className="rounded-full border-2 border-clay p-1">
        {plant.photo_url ? (
          <img src={plant.photo_url} alt={`Foto de ${plant.name}`} className="size-24 rounded-full object-cover md:size-28" />
        ) : (
          <span className="grid size-24 place-items-center rounded-full bg-mist text-4xl md:size-28">🪴</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-4xl font-semibold">{plant.name}</h1>
        <p className="text-bark">{plant.type}</p>
        <p className="text-sm text-bark">
          Con YURA desde {format(new Date(plant.created_at), "d 'de' MMM", { locale: es })}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Editar planta"
        className="grid size-11 place-items-center rounded-full text-moss hover:bg-mist"
      >
        <Pencil size={20} aria-hidden />
      </button>
    </header>
  )
}
