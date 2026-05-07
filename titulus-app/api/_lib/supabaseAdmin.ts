/**
 * Client Supabase côté serveur (clé service_role).
 * À utiliser uniquement dans les routes /api/*.
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!url || !serviceRole) {
  console.warn('[Titulus] Supabase server env vars missing — API routes will fail.')
}

export const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
})
