import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'
import cn from '../utils/cn'

type Notification = Database['public']['Tables']['notifications']['Row']

interface NotifBellProps {
  gallienId: string
}

export default function NotifBell({ gallienId }: NotifBellProps) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch 5 dernières notifs
  const fetchNotifs = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('gallien_id', gallienId)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setNotifs(data)
  }

  // Marquer toutes comme lues
  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ lue: true })
      .eq('gallien_id', gallienId)
      .eq('lue', false)
    setNotifs((prev) => prev.map((n) => ({ ...n, lue: true })))
  }

  useEffect(() => {
    fetchNotifs()

    // Realtime subscription
    const channel = supabase
      .channel(`notifs-${gallienId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `gallien_id=eq.${gallienId}`,
        },
        (payload) => {
          setNotifs((prev) => [payload.new as Notification, ...prev].slice(0, 5))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gallienId])

  // Fermer en cliquant dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifs.filter((n) => !n.lue).length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) markAllRead() }}
        className="relative p-2 rounded-sm text-gris-texte hover:text-noir hover:bg-gris-clair transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-blanc text-[10px] font-bold font-body rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-blanc border border-gris rounded-sm shadow-lg z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gris flex items-center justify-between">
            <span className="font-body text-sm font-semibold text-noir">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs font-body text-gris-texte">{unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Liste */}
          <ul className="divide-y divide-gris max-h-72 overflow-y-auto" role="list">
            {notifs.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm font-body text-gris-texte">
                Aucune notification
              </li>
            ) : (
              notifs.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'px-4 py-3',
                    !n.lue ? 'bg-or-clair/40' : ''
                  )}
                >
                  <p className="text-sm font-body font-medium text-noir leading-snug">{n.titre}</p>
                  <p className="text-xs font-body text-gris-texte mt-0.5 leading-snug">{n.message}</p>
                  <p className="text-[11px] font-body text-gris-texte mt-1">
                    {new Date(n.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
