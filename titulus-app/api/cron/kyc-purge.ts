/**
 * Cron Vercel — purge automatique des fichiers KYC > 48 h
 * Configuration : voir vercel.json (schedule: '0 * * * *' = toutes les heures).
 *
 * Sécurité : Vercel injecte automatiquement le bon User-Agent et le header
 * Authorization. On vérifie le secret CRON_SECRET pour empêcher les appels
 * extérieurs.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../_lib/supabaseAdmin'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.authorization

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Récupérer toutes les sessions dont la purge est due
  const { data: sessions, error } = await supabaseAdmin
    .from('titulus_sessions')
    .select('uuid, kyc_recto_path, kyc_selfie_path, kyc_preuve_path')
    .lte('kyc_purge_at', new Date().toISOString())
    .not('kyc_purge_at', 'is', null)

  if (error) {
    console.error('[Titulus] cron purge select error:', error)
    return res.status(500).json({ error: 'Erreur lors de la lecture.' })
  }

  let purged = 0
  for (const s of sessions ?? []) {
    const paths = [s.kyc_recto_path, s.kyc_selfie_path, s.kyc_preuve_path].filter(Boolean) as string[]
    if (paths.length > 0) {
      await supabaseAdmin.storage.from('kyc-temp').remove(paths)
    }
    await supabaseAdmin
      .from('titulus_sessions')
      .update({
        kyc_recto_path: null,
        kyc_selfie_path: null,
        kyc_preuve_path: null,
        kyc_purge_at: null,
      })
      .eq('uuid', s.uuid)
    purged++
  }

  return res.status(200).json({ purged })
}
