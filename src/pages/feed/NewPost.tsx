import { useState, type FormEvent } from 'react'
import Button from '../../components/Button'
import Card from '../../components/Card'
import ErrorText from '../../components/ErrorText'
import PhotoInput from '../../components/PhotoInput'
import { useAuth } from '../../lib/auth-context'
import { friendlyError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import { uploadImage } from '../../lib/upload'

export default function NewPost({ onPosted }: { onPosted: () => void }) {
  const { session } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!session) return
    if (!file) return setError('Elige una foto de tu planta.')
    setSaving(true)
    setError(null)
    try {
      const image_url = await uploadImage(file, session.user.id, 'posts')
      const { error } = await supabase.from('posts').insert({ image_url, caption: caption.trim() || null })
      if (error) throw new Error(friendlyError(error))
      setFile(null)
      setCaption('')
      onPosted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <h2 className="font-display text-2xl font-semibold">Comparte tu planta</h2>
        <PhotoInput label="Foto" file={file} onChange={setFile} />
        <label htmlFor="caption" className="sr-only">
          Texto
        </label>
        <textarea
          id="caption"
          rows={2}
          maxLength={500}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Cuéntanos algo de ella (opcional)"
          className="rounded-xl border border-clay/60 bg-white/80 p-3 focus:border-moss focus:outline-none"
        />
        <ErrorText>{error}</ErrorText>
        <Button type="submit" loading={saving} className="self-end">
          Publicar
        </Button>
      </form>
    </Card>
  )
}
