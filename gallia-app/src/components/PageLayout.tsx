import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import GoldRule from './GoldRule'
import cn from '../utils/cn'
import { useAuth } from '../hooks/useAuth'
import NotifBell from './NotifBell'

interface PageLayoutProps {
  children: ReactNode
  /** Affiche la sidebar latérale (pages authentifiées) */
  withSidebar?: boolean
  /** Classe CSS supplémentaire pour la zone de contenu */
  contentClassName?: string
}

export default function PageLayout({
  children,
  withSidebar = false,
  contentClassName,
}: PageLayoutProps) {
  const { gallien, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-blanc flex flex-col">
      {/* Navbar — on injecte NotifBell via slot */}
      <div className="sticky top-0 z-50 bg-blanc border-b border-gris">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display font-bold text-xl text-noir tracking-tight">IGS</span>
            <GoldRule width="1px" thickness={20} className="!w-px !h-5 inline-block" />
            <span className="font-display text-sm text-or font-medium tracking-widest uppercase">
              Gallia
            </span>
          </a>

          {/* Right slot */}
          <div className="flex items-center gap-2">
            {isAuthenticated && gallien && (
              <NotifBell gallienId={gallien.id} />
            )}
            {isAuthenticated ? (
              <a
                href="/profil"
                className="flex items-center gap-2 px-3 py-2 rounded-sm font-body text-sm font-medium text-gris-texte hover:text-noir hover:bg-gris-clair transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-or-clair border border-or flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-or-fonce font-body">
                    {gallien?.prenom?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <span className="hidden sm:block">{gallien?.prenom}</span>
              </a>
            ) : (
              <a
                href="/"
                className="font-body text-sm font-medium text-noir border border-noir rounded-sm px-4 py-2 hover:bg-noir hover:text-blanc transition-colors"
              >
                Rejoindre Gallia
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Body : sidebar + content ou pleine largeur */}
      <div className={cn('flex flex-1', withSidebar ? 'max-w-[1200px] mx-auto w-full' : '')}>
        {withSidebar && (
          <Sidebar
            gallienPrenom={gallien?.prenom}
            gallienNumero={gallien?.numero_cecg ?? undefined}
          />
        )}

        <main
          className={cn(
            'flex-1 min-w-0',
            withSidebar
              ? 'px-6 py-8 pb-24 md:pb-8'
              : 'max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8',
            contentClassName as string
          )}
          id="main-content"
        >
          {children}
        </main>
      </div>

      {/* Footer — seulement pages publiques (sans sidebar) */}
      {!withSidebar && (
        <footer className="border-t border-gris mt-auto">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-body text-xs text-gris-texte">
              © {new Date().getFullYear()} Imperio Gallorum Sociatis
            </p>
            <p className="font-display text-xs text-gris-texte italic">
              Soveregnitas non negotiatur. Exercetur.
            </p>
          </div>
        </footer>
      )}

      {/* Bottom nav mobile (pages avec sidebar uniquement) */}
      {withSidebar && <BottomNav />}
    </div>
  )
}
