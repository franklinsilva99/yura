import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import ErrorText from '../components/ErrorText'
import Field from '../components/Field'
import { friendlyError } from '../lib/errors'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/planta'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) return setError(friendlyError(error))
    navigate(from, { replace: true })
  }

  return (
    <AuthShell title="Hola de nuevo 🌱">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Correo" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Contraseña" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={loading}>Entrar</Button>
      </form>
      <p className="mt-5 text-center text-sm text-bark">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-moss underline-offset-2 hover:underline">
          Crea una
        </Link>
      </p>
    </AuthShell>
  )
}
