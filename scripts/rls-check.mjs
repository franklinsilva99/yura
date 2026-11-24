// Verifica las políticas RLS contra el proyecto real con 2 usuarios temporales.
// Uso: node --env-file=.env.local scripts/rls-check.mjs
// Los usuarios creados empiezan con "rlstest_" y se borran después con SQL.
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
const client = () => createClient(url, key, { auth: { persistSession: false } })
const tag = Date.now().toString(36)
let failures = 0
const check = (name, ok, extra = '') => {
  console.log(`${ok ? '✅' : '❌'} ${name}${extra ? ` — ${extra}` : ''}`)
  if (!ok) failures++
}

async function signUp(name) {
  const c = client()
  const { data, error } = await c.auth.signUp({
    email: `rlstest_${name}_${tag}@yura-test.dev`,
    password: 'test-password-123',
    options: { data: { username: `rlstest_${name}_${tag}`.slice(0, 24), full_name: `Test ${name}` } },
  })
  if (error || !data.session) throw new Error(`signUp ${name}: ${error?.message ?? 'sin sesión'}`)
  return { c, id: data.user.id }
}

const A = await signUp('a')
const B = await signUp('b')
check('registro sin confirmar correo devuelve sesión', true)

const { data: profA } = await A.c.from('profiles').select('username').eq('id', A.id).single()
check('trigger crea el perfil', profA?.username?.startsWith('rlstest_a'))

const { data: plantA, error: pe } = await A.c.from('plants').insert({ name: 'Pepita', type: 'Echeveria' }).select().single()
check('A crea su planta', !pe, pe?.message)
const { error: pe2 } = await A.c.from('plants').insert({ name: 'Otra', type: 'Aloe' })
check('A no puede crear una segunda planta', !!pe2)
await A.c.from('plant_logs').insert({ plant_id: plantA.id, kind: 'regue', day: '2026-11-24' })
await A.c.from('wellbeing').upsert({ day: '2026-11-24', mood: 'mal' }, { onConflict: 'user_id,day' })
const { error: up2 } = await A.c.from('wellbeing').upsert({ day: '2026-11-24', mood: 'bien' }, { onConflict: 'user_id,day' })
check('upsert de bienestar del mismo día', !up2, up2?.message)
const { data: post } = await A.c.from('posts').insert({ image_url: 'https://example.com/x.webp', caption: 'hola' }).select().single()

// --- B intenta ver / tocar lo de A ---
const { data: wbB } = await B.c.from('wellbeing').select('*')
check('B NO ve el bienestar de A', wbB?.length === 0, `filas: ${wbB?.length}`)
const { data: logsB } = await B.c.from('plant_logs').select('*')
check('B NO ve los registros de planta de A', logsB?.length === 0, `filas: ${logsB?.length}`)
const { error: wbIns } = await B.c.from('wellbeing').insert({ user_id: A.id, day: '2026-11-20', mood: 'mal' })
check('B NO puede escribir bienestar a nombre de A', !!wbIns)
const { error: logIns } = await B.c.from('plant_logs').insert({ plant_id: plantA.id, kind: 'sol', day: '2026-11-24' })
check('B NO puede registrar en la planta de A', !!logIns)
const { data: plantsB } = await B.c.from('plants').select('id')
check('B sí ve la planta de A (perfil público)', plantsB?.some((p) => p.id === plantA.id))
const { data: updPlant } = await B.c.from('plants').update({ name: 'hack' }).eq('id', plantA.id).select()
check('B NO puede editar la planta de A', updPlant?.length === 0)
const { data: delPost } = await B.c.from('posts').delete().eq('id', post.id).select()
check('B NO puede borrar el post de A', delPost?.length === 0)
const { error: fakePost } = await B.c.from('posts').insert({ user_id: A.id, image_url: 'x' })
check('B NO puede publicar a nombre de A', !!fakePost)
const { error: likeErr } = await B.c.from('likes').insert({ post_id: post.id })
check('B da me gusta', !likeErr, likeErr?.message)
const { error: comErr } = await B.c.from('comments').insert({ post_id: post.id, body: 'linda!' })
check('B comenta', !comErr, comErr?.message)
const { error: folErr } = await B.c.from('follows').insert({ following_id: A.id })
check('B sigue a A', !folErr, folErr?.message)
const { error: selfFol } = await A.c.from('follows').insert({ following_id: A.id })
check('A no puede seguirse a sí mismo', !!selfFol)

const { data: feedA } = await A.c.from('posts_feed').select('*').eq('id', post.id).single()
check('feed cuenta likes y comentarios', feedA?.like_count === 1 && feedA?.comment_count === 1 && feedA?.liked_by_me === false)
const { data: feedB } = await B.c.from('posts_feed').select('liked_by_me').eq('id', post.id).single()
check('liked_by_me para B', feedB?.liked_by_me === true)
const { data: statsA } = await B.c.from('profile_stats').select('*').eq('id', A.id).single()
check('profile_stats de A', statsA?.followers === 1 && statsA?.posts === 1, JSON.stringify(statsA))

// --- Storage ---
const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/webp' })
const { error: upOwn } = await A.c.storage.from('yura').upload(`${A.id}/plant/test.webp`, blob, { contentType: 'image/webp' })
check('A sube a su carpeta', !upOwn, upOwn?.message)
const { error: upOther } = await B.c.storage.from('yura').upload(`${A.id}/plant/evil.webp`, blob, { contentType: 'image/webp' })
check('B NO sube a la carpeta de A', !!upOther)
const { data: rmOther } = await B.c.storage.from('yura').remove([`${A.id}/plant/test.webp`])
check('B NO borra fotos de A', !rmOther?.length)
const { data: rmOwn } = await A.c.storage.from('yura').remove([`${A.id}/plant/test.webp`])
check('A borra sus fotos', rmOwn?.length === 1)

// --- Sin sesión ---
const anon = client()
const { data: anonWb } = await anon.from('wellbeing').select('*')
const { data: anonPosts } = await anon.from('posts').select('*')
check('anónimo no ve nada', anonWb?.length === 0 && anonPosts?.length === 0)

console.log(`\n${failures === 0 ? '🌱 Todo OK' : `⚠️ ${failures} fallas`} · usuarios: rlstest_*_${tag}`)
process.exit(failures ? 1 : 0)
