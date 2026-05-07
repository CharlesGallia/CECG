/**
 * Store de session déclarant — persistance partielle (sessionStorage).
 * V1 : tout en local. V2 : synchroniser avec Supabase (table `titulus_sessions`).
 *
 * Sécurité : ne pas stocker de données KYC ici. Les fichiers KYC sont uploadés
 * directement au bucket privé puis purgés sous 48 h.
 */
import type { FunnelSession } from '../types'
import { uuidv4 } from '../utils/uuid'

const STORAGE_KEY = 'titulus.session'

function emptySession(): FunnelSession {
  return {
    uuid: uuidv4(),
    status: 'IDENTITE_OK',
    consents: {
      fondements: false,
      rgpd: false,
      libreVolonte: false,
      primumNonNocere: false,
      retractation: false,
      pieceCertifiee: false,
    },
    createdAt: new Date().toISOString(),
  }
}

export function loadSession(): FunnelSession {
  if (typeof sessionStorage === 'undefined') return emptySession()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return emptySession()
    return JSON.parse(raw) as FunnelSession
  } catch {
    return emptySession()
  }
}

export function saveSession(s: FunnelSession): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // quota / mode privé
  }
}

export function clearSession(): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
