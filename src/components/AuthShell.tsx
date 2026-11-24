import type { ReactNode } from 'react'
import Card from './Card'
import Disclaimer from './Disclaimer'
import Logo from './Logo'

export default function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-4 py-10">
      <Logo size="lg" />
      <Card>
        <h1 className="mb-5 text-center font-display text-3xl font-semibold">{title}</h1>
        {children}
      </Card>
      <Disclaimer />
    </main>
  )
}
