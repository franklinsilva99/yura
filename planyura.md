# 🌱 YURA — Plan maestro de desarrollo

> **YURA** (planta en quechua) es una web responsiva para cuidar tu suculenta, registrar cómo te sientes y compartir tu plantita con una comunidad.
> Es un proyecto de estudiantes de Psicología, a presentar el **jueves 26/11/2026**.
> **Restricciones:** 1 desarrollador, 2 a 4 horas con ayuda de Claude, **costo cero** y que quede **en producción de forma permanente**.

---

## 0. Decisiones tomadas (no se reabren)

| # | Decisión | Elegido |
|---|---|---|
| D1 | Tipo de app | **Web responsiva** (sin app móvil ni PWA) |
| D2 | Stack | **Vite + React + TypeScript + Tailwind v4 + Supabase + Vercel** |
| D3 | Login | **Email + contraseña**, sin confirmación de correo |
| D4 | Datos de bienestar | **Solo uso personal y demo**: cada usuario ve solo lo suyo y el equipo no accede |
| D5 | Comunidad | **Feed global + me gusta + comentarios + seguir** (con contadores) |
| D6 | Plantas por usuario | **Una** |
| D7 | Recordatorios de riego | **Dentro de la web**: aviso "Hoy toca regar" y día marcado en el calendario (sin push ni email) |
| D8 | Costo | **0**: Supabase Free + Vercel Hobby + GitHub |

---

## 1. Fundamento (para la presentación)

- **Horticultoterapia:** cuidar algo vivo crea rutina, responsabilidad y vínculo. La planta es el **ancla** para que el estudiante vuelva cada día.
- **Automonitoreo emocional:** registrar ánimo, sueño, alimentación y carga académica aumenta la conciencia de uno mismo.
- **Apoyo social:** la comunidad refuerza la pertenencia sin exponer datos sensibles. En ella **solo se comparten plantas, nunca emociones**.

### Principios éticos y de UX (obligatorios)
1. El **bienestar es 100 % privado** y lo garantiza la base de datos (RLS), no solo la interfaz.
2. **Lenguaje no clínico**: "Así te has sentido esta semana", nunca "diagnóstico" ni "trastorno".
3. **Sin culpa**: no hay rachas que se pierdan ni mensajes negativos por no registrar.
4. **Aviso de apoyo**: si en **3 días consecutivos** con registro aparece `ánimo = Mal` **o** `sueño = No dormí` **o** `estudios = Me abruma`, se muestra una tarjeta amable con recursos de ayuda (ver §8.3).
5. **Disclaimer** visible en Bienestar y en el pie de página: *"YURA no reemplaza la atención psicológica profesional."*

---

## 2. Arquitectura

```
┌──────────────────────────────────────────────┐
│  Navegador (móvil / PC)                      │
│  SPA React (Vite) — servida por Vercel CDN   │
│  • React Router (rutas)                      │
│  • supabase-js (auth + datos + fotos)        │
│  • Chart.js (gráfico semanal)                │
│  • browser-image-compression (fotos → webp)  │
└───────────────┬──────────────────────────────┘
                │ HTTPS (anon key + JWT del usuario)
┌───────────────▼──────────────────────────────┐
│  Supabase (Free)                             │
│  • Auth: email/contraseña                    │
│  • Postgres + Row Level Security  ◄── la seguridad vive aquí │
│  • Vista posts_feed (conteos de likes/coment.)│
│  • Storage: bucket público "yura"            │
│     ruta: {user_id}/{carpeta}/{uuid}.webp     │
└──────────────────────────────────────────────┘
        ▲
        │ cada 3 días (cron)
┌───────┴──────────────┐
│ GitHub Action        │  keep-alive: evita que Supabase Free
│ keepalive.yml        │  pause el proyecto tras 7 días sin uso
└──────────────────────┘
```

**Por qué no hay backend propio:** todas las reglas de seguridad son políticas RLS de Postgres. El cliente habla directo con Supabase. La `anon key` es pública por diseño; lo que protege los datos es RLS.

---

## 3. Infraestructura (costo cero)

| Recurso | Servicio / plan | Límites relevantes | Nota |
|---|---|---|---|
| Hosting web | Vercel Hobby | 100 GB/mes de transferencia | URL: `https://yura-xxx.vercel.app` (renombrar el proyecto a `yura`) |
| BD + Auth + Storage | Supabase Free | 500 MB de BD, 1 GB de Storage, 50k usuarios activos al mes | **Se pausa a los 7 días sin actividad** → keep-alive |
| Repositorio | GitHub (público o privado) | — | Push a `main` = deploy automático |
| Keep-alive | GitHub Actions | 2000 min/mes gratis | Usa unos 30 segundos cada 3 días |
| Región Supabase | **South America (São Paulo)** | — | La más cercana a Perú |

### Variables de entorno
```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon / publishable key>
```
- En local van en `yura/.env.local` (que está en `.gitignore`).
- En Vercel: Project → Settings → Environment Variables (las mismas dos).
- En GitHub: Settings → Secrets → Actions: `SUPABASE_URL` y `SUPABASE_ANON_KEY` (para el keep-alive).
- ❌ **Nunca** usar la `service_role key` en el frontend ni subirla al repo.

---

## 4. Stack y dependencias

| Paquete | Para qué |
|---|---|
| `vite` + `react` + `typescript` | Base de la SPA |
| `tailwindcss` + `@tailwindcss/vite` (v4) | Estilos con los tokens de la paleta |
| `react-router-dom` | Rutas |
| `@supabase/supabase-js` | Auth, BD y Storage |
| `chart.js` + `react-chartjs-2` | Gráfico semanal de bienestar |
| `date-fns` (+ locale `es`) | Fechas, calendario y "hace 2 h" |
| `browser-image-compression` | Comprimir fotos antes de subirlas (≈300 KB, webp) |
| `lucide-react` | Íconos |

---

## 5. Sistema de diseño (sacado del logo)

### Paleta
| Token | Hex | Uso |
|---|---|---|
| `forest` | `#2F4A3D` | Texto principal, botón primario, títulos |
| `moss` | `#5E7D69` | Íconos, estado activo, hover |
| `sage` | `#8FA996` | Acentos, gráficos, chips seleccionados |
| `mist` | `#DCE5DD` | Fondo de tarjetas suaves, chips |
| `sand` | `#F4EFE8` | Fondo general |
| `clay` | `#BFAE9A` | Bordes, divisores (el aro del logo) |
| `bark` | `#8C7A66` | Texto secundario |
| `alert` | `#C98B6B` | Tarjeta de apoyo (cálido, no rojo alarmante) |

### Tipografía
- Títulos: **Cormorant Garamond** 500/600, con `tracking-[0.3em]` para el logotipo "Y U R A".
- Texto: **Nunito** 400/600/700.
- Google Fonts en `index.html`.

### Estilo
- Tarjetas `bg-white/70 rounded-2xl border border-clay/40 shadow-sm`.
- Botones de registro grandes, de al menos 44 px de alto (táctiles), `rounded-full`.
- Mucho espacio en blanco. Máximo `max-w-3xl mx-auto` en el contenido.
- **Responsivo**: en móvil, menú **inferior fijo** de 4 ítems. Desde `md:`, **barra lateral** izquierda con el logo.

### `src/index.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;600;700&display=swap');
@import "tailwindcss";

@theme {
  --color-forest: #2F4A3D;
  --color-moss:   #5E7D69;
  --color-sage:   #8FA996;
  --color-mist:   #DCE5DD;
  --color-sand:   #F4EFE8;
  --color-clay:   #BFAE9A;
  --color-bark:   #8C7A66;
  --color-alert:  #C98B6B;
  --font-display: "Cormorant Garamond", serif;
  --font-sans:    "Nunito", system-ui, sans-serif;
}

body { @apply bg-sand text-forest font-sans antialiased; }
```

### Logo
- Pasar `WhatsApp Image 2026-11-23 at 8.57.27 AM.jpeg` a `public/logo.png` (recortar a la suculenta para el favicon `public/favicon.png`).
- Opcional: recrear la suculenta en SVG para mayor nitidez.

---

## 6. Estructura del proyecto

```
prueba1/
├── planyura.md
└── yura/
    ├── index.html
    ├── vercel.json                 # rewrites SPA
    ├── .env.local                  # NO se sube
    ├── .github/workflows/keepalive.yml
    ├── supabase/
    │   └── schema.sql              # §7 (se pega en el SQL Editor)
    ├── public/ logo.png favicon.png
    └── src/
        ├── main.tsx                # Router + AuthProvider
        ├── index.css               # tema
        ├── lib/
        │   ├── supabase.ts         # createClient
        │   ├── auth.tsx            # AuthContext (session, profile)
        │   ├── upload.ts           # comprimir + subir a Storage
        │   ├── dates.ts            # today() local, helpers
        │   └── types.ts            # tipos de tablas y enums
        ├── components/
        │   ├── Layout.tsx          # sidebar (md+) / bottom nav (móvil)
        │   ├── Protected.tsx       # redirige a /login sin sesión
        │   ├── Logo.tsx
        │   ├── Card.tsx  Button.tsx  Avatar.tsx  ChoiceGroup.tsx
        │   └── Disclaimer.tsx
        └── pages/
            ├── Login.tsx  Register.tsx
            ├── Plant.tsx           # /planta (perfil, acciones, galería, calendario)
            ├── PlantSetup.tsx      # crear planta si no tiene
            ├── Wellbeing.tsx       # /bienestar (registro + gráfico + apoyo)
            ├── Feed.tsx            # /comunidad
            ├── PostCard.tsx        # like + comentarios
            └── Profile.tsx         # /u/:username (planta, posts, seguir)
```

### Rutas
| Ruta | Página | Acceso |
|---|---|---|
| `/login`, `/registro` | Auth | Público |
| `/` | Redirige a `/planta` | — |
| `/planta` | Mi planta (o PlantSetup si no tiene) | Autenticado |
| `/bienestar` | Mi bienestar | Autenticado (solo lo propio) |
| `/comunidad` | Feed | Autenticado |
| `/u/:username` | Perfil público | Autenticado |

---

## 7. Base de datos: `supabase/schema.sql`

> Se pega **completo una sola vez** en Supabase → SQL Editor → Run.

```sql
-- =========================================================
-- YURA · schema v1
-- =========================================================

-- ---------- ENUMS (valores de los botones) ----------
create type plant_log_kind as enum ('regue', 'sol', 'hable', 'nota');
create type mood_t  as enum ('muy_bien', 'bien', 'regular', 'mal');
create type sleep_t as enum ('excelente', 'bien', 'mal', 'no_dormi');
create type food_t  as enum ('bien', 'poco', 'no_comi');
create type study_t as enum ('muy_bien', 'bien', 'dificultad', 'abruma');

-- ---------- PROFILES ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null check (username ~ '^[a-z0-9_]{3,24}$'),
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- crea el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- PLANTS (1 por usuario) ----------
create table public.plants (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null unique default auth.uid() references public.profiles(id) on delete cascade,
  name             text not null check (char_length(name) between 1 and 40),
  type             text not null check (char_length(type) between 1 and 60),
  photo_url        text,
  water_every_days int  not null default 10 check (water_every_days between 1 and 60),
  created_at       timestamptz not null default now()
);

-- ---------- PLANT PHOTOS (línea de crecimiento) ----------
create table public.plant_photos (
  id         uuid primary key default gen_random_uuid(),
  plant_id   uuid not null references public.plants(id) on delete cascade,
  url        text not null,
  taken_on   date not null,
  created_at timestamptz not null default now()
);
create index on public.plant_photos (plant_id, taken_on desc);

-- ---------- PLANT LOGS (botones diarios) ----------
create table public.plant_logs (
  id         uuid primary key default gen_random_uuid(),
  plant_id   uuid not null references public.plants(id) on delete cascade,
  kind       plant_log_kind not null,
  note       text check (note is null or char_length(note) <= 500),
  day        date not null,               -- fecha LOCAL enviada por el cliente
  created_at timestamptz not null default now()
);
create index on public.plant_logs (plant_id, day desc);

-- ---------- WELLBEING (privado) ----------
create table public.wellbeing (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  day        date not null,               -- fecha LOCAL enviada por el cliente
  mood       mood_t,
  sleep      sleep_t,
  food       food_t,
  study      study_t,
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

-- ---------- COMUNIDAD ----------
create table public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  image_url  text not null,
  caption    text check (caption is null or char_length(caption) <= 500),
  created_at timestamptz not null default now()
);
create index on public.posts (created_at desc);

create table public.likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
create index on public.comments (post_id, created_at);

create table public.follows (
  follower_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- ---------- VISTAS ----------
create view public.posts_feed with (security_invoker = true) as
select
  p.id, p.user_id, p.image_url, p.caption, p.created_at,
  pr.username, pr.avatar_url,
  (select count(*) from public.likes l    where l.post_id = p.id)::int as like_count,
  (select count(*) from public.comments c where c.post_id = p.id)::int as comment_count,
  exists (select 1 from public.likes l where l.post_id = p.id and l.user_id = auth.uid()) as liked_by_me
from public.posts p
join public.profiles pr on pr.id = p.user_id;

create view public.profile_stats with (security_invoker = true) as
select
  pr.id, pr.username,
  (select count(*) from public.follows f where f.following_id = pr.id)::int as followers,
  (select count(*) from public.follows f where f.follower_id  = pr.id)::int as following,
  (select count(*) from public.posts   p where p.user_id      = pr.id)::int as posts
from public.profiles pr;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles     enable row level security;
alter table public.plants       enable row level security;
alter table public.plant_photos enable row level security;
alter table public.plant_logs   enable row level security;
alter table public.wellbeing    enable row level security;
alter table public.posts        enable row level security;
alter table public.likes        enable row level security;
alter table public.comments     enable row level security;
alter table public.follows      enable row level security;

-- PROFILES: lectura para usuarios logueados; editar solo el propio
create policy "profiles_read"   on public.profiles for select to authenticated using (true);
create policy "profiles_update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- PLANTS: lectura para logueados (se ve en el perfil público); escritura solo el dueño
create policy "plants_read"  on public.plants for select to authenticated using (true);
create policy "plants_write" on public.plants for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- PLANT PHOTOS: lectura para logueados (galería en el perfil); escritura solo el dueño de la planta
create policy "photos_read" on public.plant_photos for select to authenticated using (true);
create policy "photos_write" on public.plant_photos for all to authenticated
  using      (exists (select 1 from public.plants p where p.id = plant_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.plants p where p.id = plant_id and p.owner_id = auth.uid()));

-- PLANT LOGS: privado del dueño
create policy "logs_owner" on public.plant_logs for all to authenticated
  using      (exists (select 1 from public.plants p where p.id = plant_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.plants p where p.id = plant_id and p.owner_id = auth.uid()));

-- WELLBEING: estrictamente privado
create policy "wellbeing_owner" on public.wellbeing for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- POSTS
create policy "posts_read"   on public.posts for select to authenticated using (true);
create policy "posts_insert" on public.posts for insert to authenticated with check (user_id = auth.uid());
create policy "posts_delete" on public.posts for delete to authenticated using (user_id = auth.uid());

-- LIKES
create policy "likes_read"   on public.likes for select to authenticated using (true);
create policy "likes_insert" on public.likes for insert to authenticated with check (user_id = auth.uid());
create policy "likes_delete" on public.likes for delete to authenticated using (user_id = auth.uid());

-- COMMENTS
create policy "comments_read"   on public.comments for select to authenticated using (true);
create policy "comments_insert" on public.comments for insert to authenticated with check (user_id = auth.uid());
create policy "comments_delete" on public.comments for delete to authenticated using (user_id = auth.uid());

-- FOLLOWS
create policy "follows_read"   on public.follows for select to authenticated using (true);
create policy "follows_insert" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "follows_delete" on public.follows for delete to authenticated using (follower_id = auth.uid());

-- =========================================================
-- STORAGE: bucket público "yura" (fotos de plantas, posts, avatares)
-- ruta obligatoria: {user_id}/{plant|posts|avatar}/{uuid}.webp
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('yura', 'yura', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

create policy "yura_upload_own_folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'yura' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "yura_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'yura' and owner = auth.uid());
create policy "yura_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'yura' and owner = auth.uid());
```

> **Las fotos son públicas por URL** (bucket público). Es aceptable porque solo hay fotos de plantas y avatares. **Nunca** se guarda información de bienestar en Storage.

### Prueba rápida de RLS (después de crear 2 usuarios)
Con el usuario B logueado, `supabase.from('wellbeing').select()` debe devolver **solo** sus filas, nunca las de A.

---

## 8. Especificación por módulo

### 8.1 Auth (Login / Registro)
- **Registro:** username (`a-z0-9_`, 3 a 24), nombre, email y contraseña (mínimo 6).
  `supabase.auth.signUp({ email, password, options: { data: { username, full_name } } })` → el trigger crea el perfil.
- **Login:** `signInWithPassword`. Si funciona, va a `/planta`.
- Errores en español ("Ese usuario ya existe", "Correo o contraseña incorrectos").
- `AuthContext` expone `session`, `profile`, `loading` y `signOut`.
- **Criterio de aceptación:** te registras y entras directo, sin confirmar el correo.

### 8.2 Mi planta (`/planta`)
**Si no tiene planta**, se muestra PlantSetup: nombre, tipo (select: Echeveria, Haworthia, Aloe, Crassula, Sedum, Cactus, Otra), foto y "regar cada N días" (por defecto 10).

**Si tiene planta**, la pantalla muestra en orden:
1. **Cabecera:** foto circular con el aro color `clay`, nombre (Cormorant), tipo y "con YURA desde dd MMM".
2. **Aviso de riego** (tarjeta `mist`):
   - `próximo_riego = último log 'regue' + water_every_days` (si nunca se regó: hoy).
   - Si `próximo_riego ≤ hoy`: "💧 Hoy toca regar a {nombre}". Si no: "Próximo riego: {fecha} (en N días)".
3. **Botones diarios** (grandes, en grid de 2×2 en móvil y 4×1 en desktop):
   `💧 La regué` · `☀️ La puse al sol` · `💬 Le hablé` · `📝 Nota` (abre un textarea).
   Cada uno inserta en `plant_logs` con `day = today()` local. Da feedback con un toast o un check animado.
4. **Calendario mensual** (grilla de 7 columnas hecha a mano, con `date-fns`):
   - Cada día muestra mini-íconos de los logs (💧☀️💬📝).
   - El día de próximo riego va con borde punteado `moss`.
   - Flechas para ir al mes anterior o siguiente. Al tocar un día se listan sus logs y notas.
5. **Galería de crecimiento:** botón "Agregar foto" (archivo + fecha, por defecto hoy) y grid ordenado por fecha descendente con la fecha bajo cada foto.
   Botón "Compartir en comunidad" en cada foto, que crea un post con esa imagen.
6. **Editar planta:** nombre, tipo, foto y frecuencia de riego.

**Criterio:** registrar un riego actualiza el aviso y el calendario sin recargar la página.

### 8.3 Mi bienestar (`/bienestar`)
**Registro de hoy:** 4 grupos de botones tipo chip (`ChoiceGroup`). Se guarda con **upsert** en `(user_id, day)`, así que se puede cambiar durante el día.

| Pregunta | Opciones → valor enum → puntaje |
|---|---|
| ¿Cómo te sientes hoy? | Muy bien `muy_bien` 4 · Bien `bien` 3 · Regular `regular` 2 · Mal `mal` 1 |
| ¿Cómo dormiste? | Dormí excelente `excelente` 4 · Dormí bien `bien` 3 · Dormí mal `mal` 2 · No dormí `no_dormi` 1 |
| ¿Cómo comiste? | Comí bien `bien` 4 · Comí poco `poco` 2.5 · No comí `no_comi` 1 |
| ¿Cómo van tus estudios? | Muy bien `muy_bien` 4 · Bien `bien` 3 · Con dificultad `dificultad` 2 · Me abruma `abruma` 1 |

```ts
await supabase.from('wellbeing').upsert(
  { day: today(), mood, sleep, food, study, updated_at: new Date().toISOString() },
  { onConflict: 'user_id,day' }
);
```

**Gráfico semanal** (Chart.js, `Line`):
- Eje X: los últimos 7 días (lun…dom, `es`). Eje Y: 1 a 4, con etiquetas "Difícil … Muy bien".
- 4 series: Ánimo (`forest`), Sueño (`moss`), Comida (`clay`), Estudios (`sage`). Los días sin registro quedan como hueco (`spanGaps: false`).
- Navegación: "← semana anterior / siguiente →".
- Debajo, un resumen amable: "Esta semana registraste 5 días 🌿".

**Tarjeta de apoyo** (color `alert` suave):
- Condición: los **3 registros más recientes en días consecutivos** cumplen cada uno `mood='mal' OR sleep='no_dormi' OR study='abruma'`.
- Texto: *"Notamos que estos días han sido pesados. No estás solo/a 💚. Hablar con alguien puede ayudar."*
  - **Línea 113, opción 5** (salud mental, MINSA Perú, gratuita).
  - Bienestar universitario: `[completar con el contacto de la universidad]`.
- Botón "Gracias, lo tendré en cuenta" que la oculta durante la sesión.

**Privacidad:** sello visible "🔒 Solo tú puedes ver esto" y el `Disclaimer`.

### 8.4 Comunidad (`/comunidad`)
- **Nueva publicación** (arriba): foto (se comprime) + texto opcional (máx. 500) → Storage `{uid}/posts/{uuid}.webp` → insert en `posts`.
- **Feed:** `from('posts_feed').select('*').order('created_at', { ascending: false }).range(0, 19)` + botón "Ver más".
- **PostCard:** avatar + @username (enlace a `/u/:username`) · "hace 2 h" · imagen (`loading="lazy"`, `aspect-square object-cover`) · caption.
  - ❤️ **Me gusta** con actualización optimista: insert o delete en `likes` y ajuste local de `like_count` y `liked_by_me`.
  - 💬 **Comentarios:** al expandir carga `comments` con `profiles(username)`. Input de máx. 300 caracteres. El autor puede borrar los suyos.
  - El autor puede borrar su post.
- **Moderación mínima:** texto en la página de reglas ("Comparte solo tu planta, sé amable") y la opción de borrar lo propio.

### 8.5 Perfil (`/u/:username`)
- Avatar, @username, nombre y **contadores** desde `profile_stats` (seguidores · siguiendo · publicaciones).
- Botón **Seguir / Siguiendo** (insert o delete en `follows`). No aparece en el perfil propio.
- La planta del usuario (foto, nombre, tipo) y el grid de sus posts.
- En el perfil propio: editar avatar y nombre, y cerrar sesión.
- ❌ El perfil **nunca** muestra datos de bienestar.

---

## 9. Snippets base

### `src/lib/supabase.ts`
```ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### `src/lib/dates.ts`
```ts
import { format } from 'date-fns';
/** Fecha LOCAL (Perú) en yyyy-MM-dd. Nunca usar current_date de Postgres (UTC). */
export const today = () => format(new Date(), 'yyyy-MM-dd');
```

### `src/lib/upload.ts`
```ts
import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

export async function uploadImage(file: File, userId: string, folder: 'plant' | 'posts' | 'avatar') {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.3, maxWidthOrHeight: 1280, fileType: 'image/webp', useWebWorker: true,
  });
  const path = `${userId}/${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from('yura').upload(path, compressed, { contentType: 'image/webp' });
  if (error) throw error;
  return supabase.storage.from('yura').getPublicUrl(path).data.publicUrl;
}
```

### `vercel.json` (para que las rutas de la SPA no den 404)
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
```

### `.github/workflows/keepalive.yml`
```yaml
name: Supabase keep-alive
on:
  schedule:
    - cron: '0 12 */3 * *'   # cada 3 días
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -sf "${{ secrets.SUPABASE_URL }}/rest/v1/posts?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

---

## 10. Paso a paso para arrancar (setup, ~30 min)

### 10.1 Cuentas (manual)
1. **Supabase** → New project `yura`, región **São Paulo**, guardar la contraseña de la BD.
2. Supabase → **SQL Editor** → pegar §7 → **Run** (sin errores).
3. Supabase → **Authentication → Sign In / Providers → Email** → **desactivar "Confirm email"**.
4. Supabase → **Project Settings → API** → copiar `Project URL` y `anon public key`.
5. **GitHub** → crear el repo `yura`.
6. **Vercel** → entrar con GitHub (se importa el repo después del primer push).

### 10.2 Proyecto local
```bash
cd ~/Documentos/prueba1
npm create vite@latest yura -- --template react-ts
cd yura
npm i @supabase/supabase-js react-router-dom chart.js react-chartjs-2 date-fns browser-image-compression lucide-react
npm i -D tailwindcss @tailwindcss/vite
```
`vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()] });
```
Crear `.env.local` con las 2 variables, y `npm run dev` → http://localhost:5173

### 10.3 Primer deploy (temprano, para no tener sorpresas al final)
```bash
git init && git add . && git commit -m "chore: setup YURA"
git branch -M main
git remote add origin https://github.com/<usuario>/yura.git
git push -u origin main
```
Vercel → Add New Project → importar `yura` → Framework **Vite** → agregar las 2 env vars → Deploy.
Luego, Supabase → **Authentication → URL Configuration → Site URL** = la URL de Vercel.

---

## 11. Cronograma (≈3,5 h)

| # | Bloque | Min | Entregable | ✔ |
|---|---|---|---|---|
| 1 | Setup + deploy vacío | 30 | §10 completo, la web base en Vercel | ☐ |
| 2 | Layout + Auth | 25 | Tema, navegación responsiva, registro y login funcionando | ☐ |
| 3 | Mi planta | 50 | Setup de planta, botones, aviso de riego, calendario, galería | ☐ |
| 4 | Bienestar | 40 | Registro con upsert, gráfico semanal, tarjeta de apoyo, disclaimer | ☐ |
| 5 | Comunidad | 45 | Publicar, feed, likes, comentarios | ☐ |
| 6 | Perfil + seguir | 15 | `/u/:username`, contadores, seguir | ☐ |
| 7 | Cierre | 15 | Datos demo, prueba en celular, keep-alive, deploy final | ☐ |

**Orden de recorte si falta tiempo** (de lo primero a dejar fuera hacia lo último):
1. Edición de avatar → 2. Borrar comentarios → 3. Navegar meses en el calendario (solo el mes actual) → 4. Navegar semanas en el gráfico (solo la actual) → 5. "Compartir en comunidad" desde la galería.
**Nunca se recorta:** RLS, el aviso de apoyo, el disclaimer y el deploy.

---

## 12. Datos de demo (antes de presentar)

Crear 3 cuentas desde la propia web:

| Usuario | Planta | Qué hacer |
|---|---|---|
| `brigitte` | "Pepita" · Echeveria | 3 fotos de crecimiento, logs en varios días, 5 días de bienestar variados, 2 posts |
| `franklin` | "Don Aloe" · Aloe | 1 post, seguir a brigitte, likes y comentarios |
| `demo` | "Lunita" · Haworthia | Bienestar con 3 días seguidos de "Me abruma" para **mostrar la tarjeta de apoyo** |

Para los días pasados de bienestar y logs, usar SQL en Supabase (como admin):
```sql
-- reemplazar <UID> por el id del usuario (Authentication → Users)
insert into public.wellbeing (user_id, day, mood, sleep, food, study) values
('<UID>', current_date - 6, 'bien', 'bien', 'bien', 'bien'),
('<UID>', current_date - 5, 'muy_bien', 'excelente', 'bien', 'muy_bien'),
('<UID>', current_date - 4, 'regular', 'mal', 'poco', 'dificultad'),
('<UID>', current_date - 3, 'bien', 'bien', 'bien', 'bien'),
('<UID>', current_date - 1, 'regular', 'bien', 'poco', 'dificultad')
on conflict (user_id, day) do nothing;
```

---

## 13. Guion de demo (5 min para el jueves)

1. **Problema** (30 s): estrés académico y poca conciencia del propio bienestar en universitarios.
2. **Login** como `brigitte` → **Mi planta**: mostrar el aviso de riego, tocar "La regué" (se actualiza el calendario) y la galería de crecimiento.
3. **Bienestar**: responder con 4 toques, mostrar el gráfico semanal y el sello "Solo tú lo ves".
4. Cambiar a `demo` → mostrar la **tarjeta de apoyo** (punto fuerte para psicología).
5. **Comunidad**: publicar una foto, dar like y comentar. Mostrar el perfil y "seguir".
6. **Cierre**: privacidad por diseño (RLS), costo cero y URL pública permanente.

---

## 14. Buenas prácticas (checklist)

**Seguridad**
- [ ] RLS activado en **todas** las tablas (Supabase → Table Editor, sin el badge "RLS disabled").
- [ ] Probar con 2 usuarios que B no ve el bienestar ni los logs de A.
- [ ] Solo la `anon key` en el frontend. `.env.local` está en `.gitignore`.
- [ ] Storage: cada usuario sube solo a su carpeta `{uid}/…`.

**Código**
- [ ] TypeScript sin `any` en los modelos (`lib/types.ts`).
- [ ] Siempre manejar el `error` de cada llamada a Supabase y mostrar un mensaje en español.
- [ ] Estados de carga (skeleton o spinner) y estados vacíos ("Aún no hay publicaciones 🌱").
- [ ] Fechas de "día" siempre con `today()` local.
- [ ] Commits pequeños por bloque (`feat: mi planta`, `feat: bienestar`…).

**UX y accesibilidad**
- [ ] Probado en un celular real y en desktop.
- [ ] Botones de al menos 44 px, contraste AA (`forest` sobre `sand` cumple), `alt` en las imágenes.
- [ ] Labels en todos los inputs. Foco visible.

**Producción**
- [ ] Site URL de Supabase = URL de Vercel.
- [ ] Secrets del keep-alive en GitHub y una ejecución manual (`workflow_dispatch`) en verde.
- [ ] Probar las rutas directas (`/comunidad` recargando) → sin 404 gracias a `vercel.json`.

---

## 15. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Supabase pausa el proyecto (7 días sin uso) | Keep-alive con GitHub Action. Si se pausa, se reactiva con "Restore" en el dashboard (los datos no se pierden). |
| Fotos pesadas que agotan el 1 GB | Compresión a ≈300 KB webp → unas 3000 fotos |
| Fecha UTC vs. Perú (UTC-5) | `day` lo envía el cliente con `today()` local |
| Falta de tiempo | Orden de recorte de §11. Deploy desde el minuto 30. |
| Contenido inapropiado en el feed | Reglas visibles + borrar lo propio. A futuro: botón "reportar". |
| Spam de registros | Aceptable para la demo. A futuro: CAPTCHA (Supabase lo soporta gratis con hCaptcha o Turnstile). |

---

## 16. Futuro (fuera de alcance, para mencionar en la presentación)
- Recordatorios por email o push.
- Varias plantas por usuario.
- Feed "solo seguidos".
- Modo investigación con **consentimiento informado** y exportación anónima para el equipo de Psicología.
- Reportar publicaciones y moderación.
- Dominio propio (`yura.pe`, que tiene costo).

---

## 17. Convenciones para desarrollar con Claude
- Trabajar **bloque por bloque** según §11 y marcar ✔ al terminar cada uno.
- Antes de cada bloque: "implementa el bloque N de planyura.md".
- Textos de la interfaz en **español**, tono cálido y cercano. Código (variables y funciones) en **inglés**.
- Un componente por archivo. Sin librerías nuevas fuera de §4 sin acordarlo.
- Tras cada bloque: `npm run build` sin errores → commit → push (deploy automático).
