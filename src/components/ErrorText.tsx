export default function ErrorText({ children }: { children: string | null }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-xl bg-alert/15 px-3 py-2 text-sm text-forest">
      {children}
    </p>
  )
}
