-- =========================================================
-- YURA · schema v1
-- RLS policies use (select auth.uid()) so Postgres evaluates it once per query.
-- =========================================================

-- ---------- ENUMS ----------
create type plant_log_kind as enum ('regue', 'sol', 'hable', 'nota');
create type mood_t  as enum ('muy_bien', 'bien', 'regular', 'mal');
create type sleep_t as enum ('excelente', 'bien', 'mal', 'no_dormi');
create type food_t  as enum ('bien', 'poco', 'no_comi');
create type study_t as enum ('muy_bien', 'bien', 'dificultad', 'abruma');

-- ---------- PROFILES ----------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null check (username ~ '^[a-z0-9_]{3,24}$'),
  full_name   text check (full_name is null or char_length(full_name) <= 60),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
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

-- ---------- PLANT PHOTOS ----------
create table public.plant_photos (
  id         uuid primary key default gen_random_uuid(),
  plant_id   uuid not null references public.plants(id) on delete cascade,
  url        text not null,
  taken_on   date not null,
  created_at timestamptz not null default now()
);
create index on public.plant_photos (plant_id, taken_on desc);

-- ---------- PLANT LOGS ----------
create table public.plant_logs (
  id         uuid primary key default gen_random_uuid(),
  plant_id   uuid not null references public.plants(id) on delete cascade,
  kind       plant_log_kind not null,
  note       text check (note is null or char_length(note) <= 500),
  day        date not null,
  created_at timestamptz not null default now()
);
create index on public.plant_logs (plant_id, day desc);

-- ---------- WELLBEING (privado) ----------
create table public.wellbeing (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  day        date not null,
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
create index on public.posts (user_id, created_at desc);

create table public.likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index on public.likes (user_id);

create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);
create index on public.comments (post_id, created_at);
create index on public.comments (user_id);

create table public.follows (
  follower_id  uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index on public.follows (following_id);

-- ---------- VISTAS (security_invoker → respetan RLS) ----------
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

-- PROFILES
create policy "profiles_read"   on public.profiles for select to authenticated using (true);
create policy "profiles_update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- PLANTS
create policy "plants_read"  on public.plants for select to authenticated using (true);
create policy "plants_write" on public.plants for all to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

-- PLANT PHOTOS
create policy "photos_read"  on public.plant_photos for select to authenticated using (true);
create policy "photos_write" on public.plant_photos for all to authenticated
  using      (exists (select 1 from public.plants p where p.id = plant_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.plants p where p.id = plant_id and p.owner_id = (select auth.uid())));

-- PLANT LOGS (privado)
create policy "logs_owner" on public.plant_logs for all to authenticated
  using      (exists (select 1 from public.plants p where p.id = plant_id and p.owner_id = (select auth.uid())))
  with check (exists (select 1 from public.plants p where p.id = plant_id and p.owner_id = (select auth.uid())));

-- WELLBEING (estrictamente privado)
create policy "wellbeing_owner" on public.wellbeing for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- POSTS
create policy "posts_read"   on public.posts for select to authenticated using (true);
create policy "posts_insert" on public.posts for insert to authenticated with check (user_id = (select auth.uid()));
create policy "posts_delete" on public.posts for delete to authenticated using (user_id = (select auth.uid()));

-- LIKES
create policy "likes_read"   on public.likes for select to authenticated using (true);
create policy "likes_insert" on public.likes for insert to authenticated with check (user_id = (select auth.uid()));
create policy "likes_delete" on public.likes for delete to authenticated using (user_id = (select auth.uid()));

-- COMMENTS
create policy "comments_read"   on public.comments for select to authenticated using (true);
create policy "comments_insert" on public.comments for insert to authenticated with check (user_id = (select auth.uid()));
create policy "comments_delete" on public.comments for delete to authenticated using (user_id = (select auth.uid()));

-- FOLLOWS
create policy "follows_read"   on public.follows for select to authenticated using (true);
create policy "follows_insert" on public.follows for insert to authenticated with check (follower_id = (select auth.uid()));
create policy "follows_delete" on public.follows for delete to authenticated using (follower_id = (select auth.uid()));

-- =========================================================
-- STORAGE: bucket público "yura" · ruta {user_id}/{plant|posts|avatar}/{uuid}.webp
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('yura', 'yura', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

create policy "yura_upload_own_folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'yura' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "yura_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'yura' and owner = (select auth.uid()));
create policy "yura_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'yura' and owner = (select auth.uid()));
