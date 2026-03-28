import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Network, Users, Star, User } from 'lucide-react'
import GoldRule from './GoldRule'
import cn from '../utils/cn'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/cercle',    label: 'Mon Cercle', Icon: Network },
  { to: '/filleuls',  label: 'Filleuls',   Icon: Users },
  { to: '/merite',    label: 'Mérite',     Icon: Star },
  { to: '/profil',    label: 'Profil',     Icon: User },
]

interface SidebarProps {
  gallienPrenom?: string
  gallienNumero?: string
}

export default function Sidebar({ gallienPrenom, gallienNumero }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-gris bg-blanc min-h-screen sticky top-16 h-[calc(100vh-4rem)]">
      {/* Identity mini */}
      {(gallienPrenom || gallienNumero) && (
        <div className="px-5 py-4 border-b border-gris">
          <p className="font-body text-sm font-semibold text-noir truncate">{gallienPrenom}</p>
          {gallienNumero && (
            <p className="font-body text-xs text-gris-texte tracking-wider mt-0.5">{gallienNumero}</p>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Navigation secondaire">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-sm font-body text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-noir text-blanc'
                      : 'text-gris-texte hover:text-noir hover:bg-gris-clair'
                  )
                }
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <Icon
                      size={16}
                      className={cn(isActive ? 'text-blanc' : 'text-gris-texte')}
                      aria-hidden="true"
                    />
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer sidebar */}
      <div className="px-5 pb-5">
        <GoldRule className="mb-4" />
        <p className="font-body text-[11px] text-gris-texte leading-relaxed">
          Imperio Gallorum Sociatis
        </p>
        <p className="font-body text-[10px] text-gris-texte/60 mt-0.5 italic">
          Soveregnitas non negotiatur
        </p>
      </div>
    </aside>
  )
}
