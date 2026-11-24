import { LogOut, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Card from '../components/Card'
import ErrorText from '../components/ErrorText'
import Spinner from '../components/Spinner'
import { useAuth } from '../lib/auth-context'
import { friendlyError } from '../lib/errors'
import { supabase } from '../lib/supabase'
import type { Plant, Profile as ProfileT, ProfileStats } from '../lib/types'
import NotFound from './NotFound'
import EditProfile from './profile/EditProfile'

interface PostThumb {
  id: string
  image_url: string
  caption: string | null
}

interface ProfileData {
  profile: ProfileT
  stats: ProfileStats | null
  plant: Plant | null
  posts: PostThumb[]
  following: boolean
}

export default function Profile() {
  const { username = '' } = useParams()
  const { session, profile: me, signOut } = useAuth()
  const myId = session?.user.id
  const [data, setData] = useState<ProfileData | null | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle<ProfileT>()
      if (!active) return
      if (error) setError(friendlyError(error))
      if (!profile) return setData(null)
      const [stats, plant, posts, follow] = await Promise.all([
        supabase.from('profile_stats').select('*').eq('id', profile.id).maybeSingle<ProfileStats>(),
        supabase.from('plants').select('*').eq('owner_id', profile.id).maybeSingle<Plant>(),
        supabase.from('posts').select('id, image_url, caption').eq('user_id', profile.id).order('created_at', { ascending: false }),
        supabase.from('follows').select('follower_id').eq('follower_id', myId ?? '').eq('following_id', profile.id).maybeSingle(),
      ])
      if (!active) return
      const firstError = stats.error ?? plant.error ?? posts.error ?? follow.error
      if (firstError) setError(friendlyError(firstError))
      setData({
        profile,
        stats: stats.data,
        plant: plant.data,
        posts: (posts.data as PostThumb[]) ?? [],
        following: Boolean(follow.data),
      })
    })()
    return () => {
      active = false
    }
  }, [username, myId, me])

  if (data === undefined) return <Spinner />
  if (data === null) return error ? <ErrorText>{error}</ErrorText> : <NotFound />

  const { profile, stats, plant, posts, following } = data
  const isMe = profile.id === myId

  async function toggleFollow() {
    if (!data) return
    setFollowBusy(true)
    const { error } = following
      ? await supabase.from('follows').delete().eq('follower_id', myId ?? '').eq('following_id', profile.id)
      : await supabase.from('follows').insert({ following_id: profile.id })
    setFollowBusy(false)
    if (error) return setError(friendlyError(error))
    const delta = following ? -1 : 1
    setData({
      ...data,
      following: !following,
      stats: stats ? { ...stats, followers: stats.followers + delta } : stats,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <Avatar url={profile.avatar_url} name={profile.username} size={96} />
        <div>
          <h1 className="font-display text-3xl font-semibold">@{profile.username}</h1>
          {profile.full_name && <p className="text-bark">{profile.full_name}</p>}
        </div>
        <dl className="flex gap-6">
          {[
            ['seguidores', stats?.followers ?? 0],
            ['siguiendo', stats?.following ?? 0],
            ['publicaciones', stats?.posts ?? 0],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col-reverse">
              <dt className="text-sm text-bark">{label}</dt>
              <dd className="text-xl font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        {isMe ? (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditing((e) => !e)}>
              <Pencil size={16} aria-hidden /> Editar perfil
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut size={16} aria-hidden /> Cerrar sesión
            </Button>
          </div>
        ) : (
          <Button variant={following ? 'secondary' : 'primary'} loading={followBusy} onClick={toggleFollow} aria-pressed={following}>
            {following ? 'Siguiendo' : 'Seguir'}
          </Button>
        )}
      </header>

      <ErrorText>{error}</ErrorText>
      {isMe && editing && (
        <Card>
          <EditProfile profile={profile} onDone={() => setEditing(false)} />
        </Card>
      )}

      {plant && (
        <Card className="flex items-center gap-4">
          {plant.photo_url ? (
            <img src={plant.photo_url} alt={`Foto de ${plant.name}`} className="size-20 rounded-full border-2 border-clay object-cover" />
          ) : (
            <span className="grid size-20 place-items-center rounded-full bg-mist text-3xl">🪴</span>
          )}
          <div>
            <p className="text-sm text-bark">{isMe ? 'Mi planta' : 'Su planta'}</p>
            <p className="font-display text-2xl font-semibold">{plant.name}</p>
            <p className="text-bark">{plant.type}</p>
          </div>
        </Card>
      )}

      <section aria-labelledby="posts-title">
        <h2 id="posts-title" className="mb-3 font-display text-2xl font-semibold">
          Publicaciones
        </h2>
        {posts.length === 0 ? (
          <p className="rounded-2xl bg-mist/60 p-6 text-center text-bark">Aún no hay publicaciones 🌱</p>
        ) : (
          <ul className="grid grid-cols-3 gap-1 md:gap-2">
            {posts.map((p) => (
              <li key={p.id}>
                <img src={p.image_url} alt={p.caption ?? 'Publicación'} loading="lazy" className="aspect-square w-full rounded-lg object-cover" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
