import { useEffect } from 'react'

interface ToastProps {
  message: string | null
  onDone: () => void
}

export default function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [message, onDone])

  if (!message) return null
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-20 z-20 mx-auto w-fit max-w-[90vw] rounded-full bg-forest px-5 py-3 text-sand shadow-lg md:bottom-8"
    >
      {message}
    </div>
  )
}
