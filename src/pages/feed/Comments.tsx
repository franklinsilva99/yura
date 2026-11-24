import { Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import ErrorText from '../../components/ErrorText'
import { useAuth } from '../../lib/auth-context'
import { timeAgo } from '../../lib/dates'
import { friendlyError } from '../../lib/errors'
import { supabase } from '../../lib/supabase'
import type { Comment } from '../../lib/types'

interface CommentsProps {
  postId: string
  onCountChange: (delta: number) => void
}

const SELECT = 'id, post_id, user_id, body, created_at, profiles(username, avatar_url)'

export default function Comments({ postId, onCountChange }: CommentsProps) {
  const { session } = useAuth()
  const [comments, setComments] = useState<Comment[] | null>(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase
      .from('comments')
      .select(SELECT)
      .eq('post_id', postId)
      .order('created_at')
      .returns<Comment[]>()
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(friendlyError(error))
        setComments(data ?? [])
      })
    return () => {
      active = false
    }
  }, [postId])

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setSending(true)
    setError(null)
    const { data, error } = await supabase
      .from('comments')
      .insert({ post_id: postId, body: text })
      .select(SELECT)
      .single<Comment>()
    setSending(false)
    if (error) return setError(friendlyError(error))
    setComments((prev) => [...(prev ?? []), data])
    setBody('')
    onCountChange(1)
  }

  async function remove(id: string) {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) return setError(friendlyError(error))
    setComments((prev) => prev?.filter((c) => c.id !== id) ?? null)
    onCountChange(-1)
  }

  return (
    <div className="border-t border-clay/40 px-4 py-3">
      {comments === null ? (
        <p className="text-sm text-bark">Cargando comentarios…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-bark">Sé el primero en comentar 🌱</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              <p className="flex-1">
                <Link to={`/u/${c.profiles?.username ?? ''}`} className="font-semibold hover:underline">
                  @{c.profiles?.username}
                </Link>{' '}
                {c.body} <span className="text-xs text-bark">· {timeAgo(c.created_at)}</span>
              </p>
              {c.user_id === session?.user.id && (
                <button type="button" onClick={() => remove(c.id)} aria-label="Borrar comentario" className="grid size-8 place-items-center rounded-full text-bark hover:bg-mist">
                  <Trash2 size={14} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <ErrorText>{error}</ErrorText>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <label htmlFor={`c-${postId}`} className="sr-only">
          Escribe un comentario
        </label>
        <input
          id={`c-${postId}`}
          maxLength={300}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe algo amable…"
          className="min-h-11 flex-1 rounded-full border border-clay/60 bg-white/80 px-4 focus:border-moss focus:outline-none"
        />
        <button type="submit" disabled={sending || !body.trim()} className="min-h-11 rounded-full px-4 font-semibold text-moss hover:bg-mist disabled:opacity-40">
          Enviar
        </button>
      </form>
    </div>
  )
}
