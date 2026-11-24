import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/Avatar'
import { useAuth } from '../../lib/auth-context'
import { timeAgo } from '../../lib/dates'
import { supabase } from '../../lib/supabase'
import type { FeedPost } from '../../lib/types'
import Comments from './Comments'

interface PostCardProps {
  post: FeedPost
  onDeleted: (id: string) => void
}

export default function PostCard({ post, onDeleted }: PostCardProps) {
  const { session } = useAuth()
  const [liked, setLiked] = useState(post.liked_by_me)
  const [likes, setLikes] = useState(post.like_count)
  const [commentCount, setCommentCount] = useState(post.comment_count)
  const [showComments, setShowComments] = useState(false)
  const [pending, setPending] = useState(false)
  const mine = post.user_id === session?.user.id

  async function toggleLike() {
    if (pending) return
    const next = !liked
    setPending(true)
    setLiked(next)
    setLikes((n) => n + (next ? 1 : -1))
    const { error } = next
      ? await supabase.from('likes').insert({ post_id: post.id })
      : await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', session?.user.id ?? '')
    if (error) {
      setLiked(!next)
      setLikes((n) => n + (next ? -1 : 1))
    }
    setPending(false)
  }

  async function remove() {
    if (!window.confirm('¿Borrar esta publicación?')) return
    const { error } = await supabase.from('posts').delete().eq('id', post.id)
    if (!error) onDeleted(post.id)
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-clay/40 bg-white/70 shadow-sm">
      <header className="flex items-center gap-3 px-4 py-3">
        <Link to={`/u/${post.username}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar url={post.avatar_url} name={post.username} />
          <span className="truncate font-semibold hover:underline">@{post.username}</span>
        </Link>
        <span className="text-sm text-bark">{timeAgo(post.created_at)}</span>
        {mine && (
          <button type="button" onClick={remove} aria-label="Borrar publicación" className="grid size-11 place-items-center rounded-full text-bark hover:bg-mist">
            <Trash2 size={18} aria-hidden />
          </button>
        )}
      </header>
      <img src={post.image_url} alt={post.caption ?? `Planta de @${post.username}`} loading="lazy" className="aspect-square w-full bg-mist object-cover" />
      <div className="flex items-center gap-1 px-2 pt-2">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
          className="flex min-h-11 items-center gap-1.5 rounded-full px-3 hover:bg-mist"
        >
          <Heart size={22} aria-hidden className={liked ? 'fill-alert text-alert' : ''} />
          <span className="font-semibold">{likes}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowComments((s) => !s)}
          aria-expanded={showComments}
          aria-label="Comentarios"
          className="flex min-h-11 items-center gap-1.5 rounded-full px-3 hover:bg-mist"
        >
          <MessageCircle size={22} aria-hidden />
          <span className="font-semibold">{commentCount}</span>
        </button>
      </div>
      {post.caption && <p className="px-4 pb-3 whitespace-pre-line">{post.caption}</p>}
      {showComments && <Comments postId={post.id} onCountChange={(d) => setCommentCount((n) => n + d)} />}
    </article>
  )
}
