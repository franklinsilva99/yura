import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl">🍃</p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Esta página no existe</h1>
      <Link to="/planta" className="mt-4 inline-block font-semibold text-moss hover:underline">
        Volver a mi planta
      </Link>
    </div>
  )
}
