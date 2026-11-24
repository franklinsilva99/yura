interface LogoProps {
  size?: 'sm' | 'lg'
}

export default function Logo({ size = 'sm' }: LogoProps) {
  const lg = size === 'lg'
  return (
    <div className="flex flex-col items-center">
      <img src="/logo.svg" alt="" className={lg ? 'size-28' : 'size-14'} />
      <span
        className={`font-display font-semibold tracking-[0.3em] pl-[0.3em] ${lg ? 'mt-4 text-4xl' : 'mt-2 text-2xl'}`}
      >
        YURA
      </span>
      <span className="mt-1 h-px w-10 bg-clay" aria-hidden />
    </div>
  )
}
