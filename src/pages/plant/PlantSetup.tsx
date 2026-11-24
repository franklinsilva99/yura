import Card from '../../components/Card'
import type { Plant } from '../../lib/types'
import PlantForm from './PlantForm'

export default function PlantSetup({ onCreated }: { onCreated: (plant: Plant) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <p className="text-5xl">🪴</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Conoce a tu plantita</h1>
        <p className="mt-2 text-bark">Cuéntanos de tu suculenta para acompañarte a cuidarla.</p>
      </header>
      <Card>
        <PlantForm onSaved={onCreated} />
      </Card>
    </div>
  )
}
