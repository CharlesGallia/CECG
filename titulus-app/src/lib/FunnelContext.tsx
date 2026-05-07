/**
 * Context du funnel : partage l'état session entre les 6 étapes.
 */
import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { FunnelSession } from '../types'
import { loadSession, saveSession, clearSession as clearStorage } from './funnelStore'
import { FunnelContext } from './funnelContextValue'

export function FunnelProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<FunnelSession>(() => loadSession())

  useEffect(() => {
    saveSession(session)
  }, [session])

  const update = useCallback((patch: Partial<FunnelSession>) => {
    setSession((s) => ({ ...s, ...patch }))
  }, [])

  const updateConsents = useCallback((patch: Partial<FunnelSession['consents']>) => {
    setSession((s) => ({ ...s, consents: { ...s.consents, ...patch } }))
  }, [])

  const reset = useCallback(() => {
    clearStorage()
    setSession(loadSession())
  }, [])

  return (
    <FunnelContext.Provider value={{ session, update, updateConsents, reset }}>
      {children}
    </FunnelContext.Provider>
  )
}
