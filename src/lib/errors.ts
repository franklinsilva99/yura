/** Traduce errores de Supabase a mensajes amables en español. */
export function friendlyError(error: { message?: string; code?: string } | null | undefined): string {
  const msg = error?.message?.toLowerCase() ?? ''
  if (msg.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('already registered') || msg.includes('already been registered'))
    return 'Ese correo ya tiene una cuenta.'
  if (msg.includes('email not confirmed')) return 'Tu correo aún no está confirmado.'
  if (msg.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('database error saving new user') || error?.code === '23505')
    return 'Ese usuario ya existe. Prueba con otro.'
  if (msg.includes('rate limit')) return 'Demasiados intentos. Espera un momento.'
  if (msg.includes('failed to fetch') || msg.includes('network')) return 'Sin conexión. Revisa tu internet.'
  return 'Algo salió mal. Intenta de nuevo.'
}
