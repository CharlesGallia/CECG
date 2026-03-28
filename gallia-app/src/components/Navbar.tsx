import { Link, useLocation } from 'react-router-dom'
import { User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import GoldRule from './GoldRule'
import cn from '../utils/cn'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/cercle',    label: 'Mon Cercle' },
  { href: '/filleuls',  label: 'Filleuls' },
  { href: '/merite',    label: 'Mérite' },
]

interface NavbarProps {
  gallienPrenom?: string
  isAuthenticated?: boolean
}

export default function Navbar({ gallienPrenom, isAuthenticated = false }: NavbarProps) {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-blanc border-b border-gris">
      <nav
        className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"
        aria-label="Navigation principale"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display font-bold text-xl text-noir tracking-tight">
            IGS
          </span>
          <GoldRule width="1px" thickness={20} className="!w-px !h-5 inline-block" />
          <span className="font-display text-sm text-or font-medium tracking-widest uppercase">
            Gallia
          </span>
        </Link>

        {/* Desktop nav links */}
        {isAuthenticated && (
          <ul className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <li key={href}>
                  <Link
                    to={href}
                    className={cn(
                      'px-3 py-2 rounded-sm font-body text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'text-noir bg-gris-clair'
                        : 'text-gris-texte hover:text-noir hover:bg-gris-clair'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        {/* Right section */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/profil"
              className="flex items-center gap-2 px-3 py-2 rounded-sm font-body text-sm font-medium text-gris-texte hover:text-noir hover:bg-gris-clair transition-colors duration-150"
              aria-label="Mon profil"
            >
              <div className="w-7 h-7 rounded-full bg-or-clair border border-or flex items-center justify-center">
                <span className="text-xs font-semibold text-or-fonce font-body">
                  {gallienPrenom ? gallienPrenom[0].toUpperCase() : <User size={14} />}
                </span>
              </div>
              <span className="hidden sm:block">{gallienPrenom ?? 'Profil'}</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="font-body text-sm font-medium text-noir border border-noir rounded-sm px-4 py-2 hover:bg-noir hover:text-blanc transition-colors duration-200"
            >
              Rejoindre Gallia
            </Link>
          )}

          {/* Mobile hamburger */}
          {isAuthenticated && (
            <button
              className="md:hidden p-2 rounded-sm text-noir hover:bg-gris-clair transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isAuthenticated && menuOpen && (
        <div className="md:hidden border-t border-gris bg-blanc">
          <ul className="px-4 py-3 space-y-1" role="list">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <li key={href}>
                  <Link
                    to={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'block px-3 py-2.5 rounded-sm font-body text-sm font-medium transition-colors',
                      isActive
                        ? 'text-noir bg-gris-clair'
                        : 'text-gris-texte hover:text-noir hover:bg-gris-clair'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
            <li>
              <Link
                to="/profil"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-sm font-body text-sm font-medium text-gris-texte hover:text-noir hover:bg-gris-clair transition-colors"
              >
                Mon Profil
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
