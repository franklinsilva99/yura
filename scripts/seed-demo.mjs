// Crea las 3 cuentas demo de §12 con datos de ejemplo.
// Uso: node --env-file=.env.local scripts/seed-demo.mjs
import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const PASSWORD = 'yura2026'
const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
const img = (name) => new URL(`./demo-img/${name}.webp`, import.meta.url)

function must(res, what) {
  if (res.error) throw new Error(`${what}: ${res.error.message}`)
  return res.data
}

async function account(username, full_name) {
  const c = createClient(url, key, { auth: { persistSession: false } })
  const email = `${username}@yura-demo.dev`
  let res = await c.auth.signInWithPassword({ email, password: PASSWORD })
  if (res.error) res = await c.auth.signUp({ email, password: PASSWORD, options: { data: { username, full_name } } })
  const { user } = must(res, `cuenta ${username}`)
  return { c, id: user.id, username }
}

async function upload(u, folder, name) {
  const body = await readFile(img(name))
  const path = `${u.id}/${folder}/${crypto.randomUUID()}.webp`
  must(await u.c.storage.from('yura').upload(path, body, { contentType: 'image/webp' }), `subir ${name}`)
  return u.c.storage.from('yura').getPublicUrl(path).data.publicUrl
}

async function plantFor(u, name, type, photo, created_at) {
  const existing = must(await u.c.from('plants').select('*').eq('owner_id', u.id).maybeSingle(), 'planta')
  if (existing) return { plant: existing, fresh: false }
  const photo_url = await upload(u, 'plant', photo)
  const plant = must(await u.c.from('plants').insert({ name, type, photo_url, water_every_days: 10 }).select().single(), 'crear planta')
  return { plant, fresh: true }
}

const brigitte = await account('brigitte', 'Brigitte')
const franklin = await account('franklin', 'Franklin')
const demo = await account('demo', 'Cuenta demo')

// ---- brigitte ----
const b = await plantFor(brigitte, 'Pepita', 'Echeveria', 'pepita-3')
if (b.fresh) {
  const photos = []
  for (const [name, taken_on] of [['pepita-1', '2026-10-12'], ['pepita-2', '2026-11-02'], ['pepita-3', '2026-11-22']]) {
    const url = await upload(brigitte, 'plant', name)
    photos.push(url)
    must(await brigitte.c.from('plant_photos').insert({ plant_id: b.plant.id, url, taken_on }), 'foto')
  }
  must(await brigitte.c.from('plant_logs').insert([
    { plant_id: b.plant.id, kind: 'regue', day: '2026-11-06' },
    { plant_id: b.plant.id, kind: 'sol', day: '2026-11-10' },
    { plant_id: b.plant.id, kind: 'hable', day: '2026-11-12' },
    { plant_id: b.plant.id, kind: 'regue', day: '2026-11-16' },
    { plant_id: b.plant.id, kind: 'sol', day: '2026-11-18' },
    { plant_id: b.plant.id, kind: 'nota', note: '¡Le salió una hojita nueva en el centro!', day: '2026-11-20' },
    { plant_id: b.plant.id, kind: 'hable', day: '2026-11-22' },
    { plant_id: b.plant.id, kind: 'sol', day: '2026-11-23' },
  ]), 'logs brigitte')
  must(await brigitte.c.from('wellbeing').upsert([
    { day: '2026-11-19', mood: 'bien', sleep: 'bien', food: 'bien', study: 'bien' },
    { day: '2026-11-20', mood: 'muy_bien', sleep: 'excelente', food: 'bien', study: 'muy_bien' },
    { day: '2026-11-21', mood: 'regular', sleep: 'mal', food: 'poco', study: 'dificultad' },
    { day: '2026-11-23', mood: 'bien', sleep: 'bien', food: 'bien', study: 'bien' },
    { day: '2026-11-24', mood: 'regular', sleep: 'bien', food: 'poco', study: 'dificultad' },
  ], { onConflict: 'user_id,day' }), 'bienestar brigitte')
  must(await brigitte.c.from('posts').insert({ image_url: photos[0], caption: 'Así llegó Pepita a casa 🌱' }), 'post 1')
  must(await brigitte.c.from('posts').insert({ image_url: photos[2], caption: '¡Miren cuánto ha crecido Pepita en un mes! 💚' }), 'post 2')
}

// ---- franklin ----
const f = await plantFor(franklin, 'Don Aloe', 'Aloe', 'donaloe')
if (f.fresh) {
  must(await franklin.c.from('plant_logs').insert([
    { plant_id: f.plant.id, kind: 'regue', day: '2026-11-20' },
    { plant_id: f.plant.id, kind: 'sol', day: '2026-11-22' },
  ]), 'logs franklin')
  must(await franklin.c.from('posts').insert({ image_url: f.plant.photo_url, caption: 'Les presento a Don Aloe 🌵' }), 'post franklin')
  must(await franklin.c.from('follows').insert({ following_id: brigitte.id }), 'seguir')
  const bPosts = must(await franklin.c.from('posts').select('id').eq('user_id', brigitte.id), 'posts de brigitte')
  for (const p of bPosts) must(await franklin.c.from('likes').insert({ post_id: p.id }), 'like')
  must(await franklin.c.from('comments').insert({ post_id: bPosts[0].id, body: '¡Está preciosa! ¿Cada cuánto la riegas?' }), 'comentario')
  const fPost = must(await brigitte.c.from('posts').select('id').eq('user_id', franklin.id).single(), 'post franklin')
  must(await brigitte.c.from('likes').insert({ post_id: fPost.id }), 'like brigitte')
  must(await brigitte.c.from('comments').insert({ post_id: fPost.id, body: 'Qué buen nombre 😄' }), 'comentario brigitte')
}

// ---- demo (tarjeta de apoyo) ----
const d = await plantFor(demo, 'Lunita', 'Haworthia', 'lunita')
if (d.fresh) {
  must(await demo.c.from('plant_logs').insert({ plant_id: d.plant.id, kind: 'regue', day: '2026-11-21' }), 'logs demo')
  must(await demo.c.from('wellbeing').upsert([
    { day: '2026-11-21', mood: 'bien', sleep: 'bien', food: 'bien', study: 'bien' },
    { day: '2026-11-23', mood: 'regular', sleep: 'mal', food: 'poco', study: 'abruma' },
    { day: '2026-11-24', mood: 'mal', sleep: 'mal', food: 'poco', study: 'abruma' },
    { day: '2026-11-25', mood: 'regular', sleep: 'no_dormi', food: 'no_comi', study: 'abruma' },
  ], { onConflict: 'user_id,day' }), 'bienestar demo')
}

console.log('🌱 Demo lista: brigitte / franklin / demo @yura-demo.dev · contraseña:', PASSWORD)
