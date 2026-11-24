import { useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import ErrorText from '../../components/ErrorText'
import Field from '../../components/Field'
import PhotoInput from '../../components/PhotoInput'
import { useAuth } from '../../lib/auth-context'
import { friendlyError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import type { Profile } from '../../lib/types'
import { uploadImage } from '../../lib/upload'

interface EditProfileProps {
  profile: Profile
  onDone: () => void
}

export default function EditProfile({ profile, onDone }: EditProfileProps) {
  const { refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const avatar_url = file ? await uploadImage(file, profile.id, 'avatar') : profile.avatar_url
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() || null, avatar_url })
        .eq('id', profile.id)
      if (error) throw new Error(friendlyError(error))
      await refreshProfile()
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <PhotoInput label="Foto de perfil" file={file} onChange={setFile} currentUrl={profile.avatar_url} />
      <Field label="Nombre" maxLength={60} value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button type="submit" loading={saving} className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
