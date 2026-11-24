import Button from '../../components/Button'

export default function SupportCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <section aria-labelledby="support-title" className="rounded-2xl border border-alert/50 bg-alert/15 p-5">
      <h2 id="support-title" className="font-display text-2xl font-semibold">
        Estamos contigo 💚
      </h2>
      <p className="mt-2">
        Notamos que estos días han sido pesados. No estás solo/a. Hablar con alguien puede ayudar.
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        <li>
          📞{' '}
          <a href="tel:113" className="font-semibold underline underline-offset-2">
            Línea 113, opción 5
          </a>{' '}
          — salud mental, MINSA Perú, gratuita.
        </li>
        <li>🎓 Bienestar universitario: [completar con el contacto de la universidad]</li>
      </ul>
      <Button variant="secondary" onClick={onDismiss} className="mt-4">
        Gracias, lo tendré en cuenta
      </Button>
    </section>
  )
}
