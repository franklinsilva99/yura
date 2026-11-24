# YURA

Plan maestro y decisiones cerradas: `planyura.md` (no reabrir §0). Trabajar bloque por bloque (§11).

- Stack: Vite + React 19 + TS + Tailwind v4 (`@theme` en `src/index.css`) + Supabase + Vercel.
- UI en español, cálida y no clínica; código en inglés. Un componente por archivo. Sin libs fuera de §4 sin acordarlo.
- La seguridad vive en RLS (`supabase/migrations/`). Bienestar y plant_logs son privados; nunca exponerlos en comunidad/perfil.
- Fechas de `day` siempre con `today()` local (`src/lib/dates.ts`), nunca `current_date`.
- Manejar siempre el `error` de Supabase con mensaje en español; estados de carga y vacíos.
- Solo `anon key` en el frontend; `.env.local` no se sube.
- Antes de commit: `npm run build` y `npm run lint` sin errores. Commits pequeños por bloque.
