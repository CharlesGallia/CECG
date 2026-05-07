/**
 * Client Supabase côté navigateur (clé anon publique).
 * Utilisé uniquement pour l'upload KYC vers le bucket privé `kyc-temp`
 * via une URL signée fournie par l'API serveur.
 *
 * Les écritures sensibles (sessions, statuts) passent par les routes /api/*
 * qui utilisent la clé service_role côté serveur.
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL ?? ''
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
})

export const isSupabaseConfigured = !!url && !!anon
