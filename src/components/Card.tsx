import type { HTMLAttributes } from 'react'

export default function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-clay/40 bg-white/70 p-5 shadow-sm ${className}`}
      {...rest}
    />
  )
}
