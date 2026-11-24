import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-sand hover:bg-moss',
  secondary: 'bg-mist text-forest hover:bg-sage/50',
  ghost: 'text-moss hover:bg-mist',
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-semibold transition-colors disabled:opacity-60 ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? 'Un momento…' : children}
    </button>
  )
}
