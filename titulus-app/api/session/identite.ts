/**
 * POST /api/session/identite
 * Body: { uuid, prenom, nom, email, hcaptchaToken, consents }
 * Persiste l'identité de base après vérification hCaptcha.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../_lib/supabaseAdmin'
import { verifyHcaptcha } from '../_lib/hcaptcha'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, prenom, nom, email, hcaptchaToken, consents } = req.body ?? {}

  if (!uuid || !prenom || !nom || !email) {
    return res.status(400).json({ error: 'Champs requis manquants.' })
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
  const ok = await verifyHcaptcha(hcaptchaToken, ip)
  if (!ok) return res.status(400).json({ error: 'Vérification hCaptcha échouée.' })

  const { error } = await supabaseAdmin
    .from('titulus_sessions')
    .upsert({
      uuid,
      prenom: String(prenom).trim().slice(0, 50),
      nom: String(nom).trim().slice(0, 50).toUpperCase(),
      email: String(email).trim().toLowerCase().slice(0, 200),
      consents: consents ?? {},
      user_agent: req.headers['user-agent']?.slice(0, 500) ?? null,
      status: 'IDENTITE_OK',
    }, { onConflict: 'uuid' })

  if (error) {
    console.error('[Titulus] Supabase identite upsert error:', error)
    return res.status(500).json({ error: 'Erreur de persistance.' })
  }

  return res.status(200).json({ ok: true })
}
