import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Network, Users, Star, User } from 'lucide-react'
import cn from '../utils/cn'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/cercle',    label: 'Cercle',    Icon: Network },
  { to: '/filleuls',  label: 'Filleuls',  Icon: Users },
  { to: '/merite',    label: 'Mérite',    Icon: Star },
  { to: '/profil',    label: 'Profil',    Icon: User },
]

export default function BottomNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-blanc border-t border-gris"
      aria-label="Navigation mobile"
    >
      <ul className="flex items-stretch h-16" role="list">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 h-full w-full',
                  'font-body text-[10px] font-medium transition-colors duration-150',
                  isActive ? 'text-noir' : 'text-gris-texte'
                )
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <Icon
                    size={20}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-or' : 'text-gris-texte'
                    )}
                    aria-hidden="true"
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
