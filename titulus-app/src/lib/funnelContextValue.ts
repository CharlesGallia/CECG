import { createContext, useContext } from 'react'
import type { FunnelSession } from '../types'

export type FunnelCtx = {
  session: FunnelSession
  update: (patch: Partial<FunnelSession>) => void
  updateConsents: (patch: Partial<FunnelSession['consents']>) => void
  reset: () => void
}

export const FunnelContext = createContext<FunnelCtx | null>(null)

export function useFunnel(): FunnelCtx {
  const ctx = useContext(FunnelContext)
  if (!ctx) throw new Error('useFunnel doit être utilisé dans <FunnelProvider>')
  return ctx
}
