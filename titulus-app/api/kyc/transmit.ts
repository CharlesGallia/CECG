/**
 * POST /api/kyc/transmit
 * Body: { uuid, paths: { recto, selfie, preuve } }
 * Marque la session comme KYC_TRANSMIS, programme la purge auto sous 48 h,
 * et envoie l'e-mail final.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../_lib/supabaseAdmin'
import { sendEmail, imperialEmailHtml } from '../_lib/resendClient'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, paths } = req.body ?? {}
  if (!uuid || !paths?.recto || !paths?.selfie || !paths?.preuve) {
    return res.status(400).json({ error: 'Trois pièces requises.' })
  }

  const purgeAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString()

  const { data: session, error } = await supabaseAdmin
    .from('titulus_sessions')
    .update({
      kyc_recto_path: paths.recto,
      kyc_selfie_path: paths.selfie,
      kyc_preuve_path: paths.preuve,
      kyc_purge_at: purgeAt,
      status: 'KYC_TRANSMIS',
    })
    .eq('uuid', uuid)
    .eq('status', 'DECLARATIO_SIGNEE')
    .select('email, prenom, nom, numero_declaratio')
    .single()

  if (error || !session) {
    console.error('[Titulus] kyc transmit error:', error)
    return res.status(500).json({ error: 'Erreur de transmission KYC.' })
  }

  if (session.email) {
    await sendEmail({
      to: session.email,
      subject: `Imperio Gallorum Sociatis — Confirmation de votre déclaration · ${session.numero_declaratio}`,
      html: imperialEmailHtml({
        titre: 'Salve, Cive Gallice.',
        corps: `
          <p><em>Votre déclaration est enregistrée. Vous êtes inscrit au registre des Galliens primo-déclarés.</em></p>
          <p>Numéro de Declaratio&nbsp;: <strong>${session.numero_declaratio}</strong></p>
          <ul>
            <li><strong>Sous 48 h</strong> : examen de votre dossier KYC ; vos pièces sont purgées automatiquement après vérification.</li>
            <li><strong>Sous 21 jours</strong> après validation KYC : émission et expédition de votre <em>Titulus Civilis</em>.</li>
            <li><strong>Sous 7 jours</strong> : accès à votre espace personnel sur gallia.space.</li>
          </ul>
          <p style="margin-top:18px;font-style:italic;color:#5A4D2A;">Gallia Aeterna.</p>
        `,
      }),
    })
  }

  return res.status(200).json({ ok: true })
}
