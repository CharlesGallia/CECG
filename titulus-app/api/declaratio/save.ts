/**
 * POST /api/declaratio/save
 * Body: { uuid, declaratio: {...}, primumNonNocere: boolean }
 * Persiste les données Declaratio (étape III).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin } from '../_lib/supabaseAdmin'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { uuid, declaratio, primumNonNocere } = req.body ?? {}
  if (!uuid || !declaratio) return res.status(400).json({ error: 'Champs requis manquants.' })

  // Vérifier statut PAIEMENT_OK
  const { data: existing } = await supabaseAdmin
    .from('titulus_sessions')
    .select('status, consents')
    .eq('uuid', uuid)
    .single()

  if (!existing || existing.status !== 'PAIEMENT_OK') {
    return res.status(403).json({ error: 'Paiement non confirmé pour cette session.' })
  }

  const { error } = await supabaseAdmin
    .from('titulus_sessions')
    .update({
      prenom: declaratio.prenom,
      nom: String(declaratio.nom).toUpperCase(),
      nom_gallien: declaratio.nomGallien || null,
      date_naissance: declaratio.dateNaissance,
      lieu_naissance: declaratio.lieuNaissance,
      pays_naissance: declaratio.paysNaissance,
      nationalite: declaratio.nationalite,
      numero_voie: declaratio.numeroVoie,
      complement_adresse: declaratio.complementAdresse || null,
      code_postal: declaratio.codePostal,
      ville: declaratio.ville,
      pays: declaratio.pays,
      telephone: declaratio.telephone,
      email: declaratio.email,
      consents: { ...(existing.consents ?? {}), primumNonNocere: !!primumNonNocere },
      status: 'DECLARATIO_OK',
    })
    .eq('uuid', uuid)

  if (error) {
    console.error('[Titulus] declaratio save error:', error)
    return res.status(500).json({ error: 'Erreur de persistance.' })
  }
  return res.status(200).json({ ok: true })
}
