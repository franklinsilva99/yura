import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import Button from '../components/Button'
import ErrorText from '../components/ErrorText'
import Field from '../components/Field'
import { friendlyError } from '../lib/errors'
import { supabase } from '../lib/supabase'

const USERNAME_RE = /^[a-z0-9_]{3,24}$/

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!USERNAME_RE.test(username)) {
      return setError('El usuario debe tener de 3 a 24 caracteres: letras minúsculas, números o _.')
    }
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username, full_name: fullName.trim() || null } },
    })
    setLoading(false)
    if (error) return setError(friendlyError(error))
    if (!data.session) {
      return setError('Tu cuenta se creó, pero falta confirmar el correo. Avísale al equipo de YURA.')
    }
    navigate('/planta', { replace: true })
  }

  return (
    <AuthShell title="Crea tu cuenta">
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field
          label="Usuario"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
          hint="Así te verán en la comunidad. Ej.: maria_23"
          maxLength={24}
        />
        <Field label="Nombre" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={60} />
        <Field label="Correo" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Mínimo 6 caracteres."
        />
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={loading}>Crear cuenta</Button>
      </form>
      <p className="mt-5 text-center text-sm text-bark">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-moss underline-offset-2 hover:underline">
          Entra aquí
        </Link>
      </p>
    </AuthShell>
  )
}
