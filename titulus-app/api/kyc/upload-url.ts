/**
 * POST /api/kyc/upload-url
 * Body: { uuid, kind: 'recto' | 'selfie' | 'preuve', contentType }
 * Renvoie une URL signée pour l'upload direct au bucket privé `kyc-temp`.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../_lib/supabaseAdmin'

const ALLOWED = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf']

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, kind, contentType } = req.body ?? {}
  if (!uuid || !['recto', 'selfie', 'preuve'].includes(kind)) {
    return res.status(400).json({ error: 'Paramètres invalides.' })
  }
  if (!contentType || !ALLOWED.includes(contentType)) {
    return res.status(400).json({ error: 'Format non accepté.' })
  }

  // Vérifier statut DECLARATIO_SIGNEE
  const { data: session } = await supabaseAdmin
    .from('titulus_sessions')
    .select('status')
    .eq('uuid', uuid)
    .single()
  if (!session || !['DECLARATIO_SIGNEE', 'KYC_TRANSMIS'].includes(session.status)) {
    return res.status(403).json({ error: 'Étape précédente non complétée.' })
  }

  const ext = contentType === 'application/pdf' ? 'pdf'
            : contentType.split('/')[1].replace('jpeg', 'jpg')
  const path = `${uuid}/${kind}-${Date.now()}.${ext}`

  const { data, error } = await supabaseAdmin.storage
    .from('kyc-temp')
    .createSignedUploadUrl(path)

  if (error || !data) {
    console.error('[Titulus] signed upload URL error:', error)
    return res.status(500).json({ error: 'Erreur d\'upload.' })
  }

  return res.status(200).json({
    uploadUrl: data.signedUrl,
    token: data.token,
    path,
  })
}
