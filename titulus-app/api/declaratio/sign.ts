/**
 * POST /api/declaratio/sign
 * Body: { uuid, numeroDeclaratio, signatureDataUrl, hcaptchaToken, pdfHash }
 * Marque la Declaratio comme signée et archive l'IP.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../_lib/supabaseAdmin'
import { verifyHcaptcha } from '../_lib/hcaptcha'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, numeroDeclaratio, signatureDataUrl, hcaptchaToken, pdfHash } = req.body ?? {}
  if (!uuid || !numeroDeclaratio || !signatureDataUrl) {
    return res.status(400).json({ error: 'Champs requis manquants.' })
  }

  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
  const ok = await verifyHcaptcha(hcaptchaToken, ip)
  if (!ok) return res.status(400).json({ error: 'Vérification hCaptcha échouée.' })

  const { error } = await supabaseAdmin
    .from('titulus_sessions')
    .update({
      numero_declaratio: numeroDeclaratio,
      signature_data_url: signatureDataUrl,
      pdf_hash: pdfHash ?? null,
      signature_ip: ip ?? null,
      status: 'DECLARATIO_SIGNEE',
    })
    .eq('uuid', uuid)
    .eq('status', 'DECLARATIO_OK') // n'autoriser que depuis le bon état

  if (error) {
    console.error('[Titulus] declaratio sign error:', error)
    return res.status(500).json({ error: 'Erreur de persistance.' })
  }
  return res.status(200).json({ ok: true })
}
