interface AvatarProps {
  url: string | null | undefined
  name: string
  size?: number
}

export default function Avatar({ url, name, size = 40 }: AvatarProps) {
  const style = { width: size, height: size }
  if (url) {
    return (
      <img
        src={url}
        alt={`Foto de ${name}`}
        style={style}
        className="shrink-0 rounded-full border border-clay/60 object-cover"
      />
    )
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.42 }}
      className="grid shrink-0 place-items-center rounded-full bg-mist font-semibold text-moss uppercase"
      aria-hidden
    >
      {name.charAt(0)}
    </span>
  )
}
