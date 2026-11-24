import { HeartPulse, Sprout, User, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import Disclaimer from './Disclaimer'
import Logo from './Logo'

export default function Layout() {
  const { profile } = useAuth()
  const items = [
    { to: '/planta', label: 'Mi planta', icon: Sprout },
    { to: '/bienestar', label: 'Bienestar', icon: HeartPulse },
    { to: '/comunidad', label: 'Comunidad', icon: Users },
    { to: profile ? `/u/${profile.username}` : '/perfil', label: 'Perfil', icon: User },
  ]

  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden md:sticky md:top-0 md:flex md:h-dvh md:w-60 md:shrink-0 md:flex-col md:border-r md:border-clay/40 md:px-4 md:py-8">
        <Logo />
        <nav className="mt-10 flex flex-col gap-1" aria-label="Principal">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-full px-4 transition-colors ${
                  isActive ? 'bg-mist font-semibold text-forest' : 'text-bark hover:bg-mist/60'
                }`
              }
            >
              <Icon size={20} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <Disclaimer className="mt-auto" />
      </aside>

      <div className="flex-1 pb-24 md:pb-8">
        <main className="mx-auto max-w-3xl px-4 py-6 md:py-10">
          <Outlet />
        </main>
        <Disclaimer className="px-4 md:hidden" />
      </div>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-clay/40 bg-sand/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
                isActive ? 'font-semibold text-forest' : 'text-bark'
              }`
            }
          >
            <Icon size={22} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
