import { useCallback, useEffect, useState } from 'react'
import Button from '../components/Button'
import ErrorText from '../components/ErrorText'
import Spinner from '../components/Spinner'
import { friendlyError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { FeedPost } from '../lib/types'
import NewPost from './feed/NewPost'
import PostCard from './feed/PostCard'

const PAGE = 20

async function fetchPage(from: number) {
  return supabase
    .from('posts_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, from + PAGE - 1)
    .returns<FeedPost[]>()
}

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[] | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    fetchPage(0).then(({ data, error }) => {
      if (!active) return
      setError(error ? friendlyError(error) : null)
      setPosts(data ?? [])
      setHasMore((data?.length ?? 0) === PAGE)
    })
    return () => {
      active = false
    }
  }, [reloadKey])

  async function loadMore() {
    setLoadingMore(true)
    const { data, error } = await fetchPage(posts?.length ?? 0)
    setLoadingMore(false)
    if (error) return setError(friendlyError(error))
    setPosts((prev) => [...(prev ?? []), ...(data ?? [])])
    setHasMore((data?.length ?? 0) === PAGE)
  }

  const onDeleted = useCallback((id: string) => setPosts((prev) => prev?.filter((p) => p.id !== id) ?? null), [])

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-4xl font-semibold">Comunidad</h1>
        <p className="mt-1 text-bark">Comparte solo tu planta y sé amable 💚</p>
      </header>
      <NewPost onPosted={() => setReloadKey((k) => k + 1)} />
      <ErrorText>{error}</ErrorText>
      {posts === null ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <p className="rounded-2xl bg-mist/60 p-8 text-center text-bark">Aún no hay publicaciones 🌱 ¡Estrena la comunidad!</p>
      ) : (
        <div className="flex flex-col gap-6">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onDeleted={onDeleted} />
          ))}
          {hasMore && (
            <Button variant="secondary" loading={loadingMore} onClick={loadMore} className="self-center">
              Ver más
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
