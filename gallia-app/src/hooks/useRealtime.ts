import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type Table = 'galliens' | 'merite_gallien' | 'transactions_gl' | 'notifications'
type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions {
  table: Table
  event?: Event
  filter?: string
  onchange: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void
}

/**
 * Hook générique pour les subscriptions Supabase Realtime.
 * Cleanup automatique au démontage.
 */
export function useRealtime({ table, event = '*', filter, onchange }: UseRealtimeOptions) {
  useEffect(() => {
    const channelName = `realtime-${table}-${filter ?? 'all'}-${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        onchange
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, event, filter, onchange])
}
