/**
 * Edge Function : distribuer-commissions
 *
 * Declenchee quand cecg_statut -> 'definitive' via trigger Supabase.
 * Distribue les commissions GL et le Merite aux parrains N1->N5.
 *
 * Commissions exactes :
 * N1 = 7,00 GL  N2 = 2,00 GL  N3 = 1,00 GL  N4 = 0,50 GL  N5 = 0,25 GL
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const COMMISSIONS: Record<number, number> = {
  1: 7.00,
  2: 2.00,
  3: 1.00,
  4: 0.50,
  5: 0.25,
}

// Points de merite generes par niveau
const MERITE_PAR_NIVEAU: Record<number, number> = {
  1: 100,
  2: 50,
  3: 25,
  4: 15,
  5: 10,
}

Deno.serve(async (req: Request) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const body = await req.json()
    const gallienId: string = body.gallienId ?? body.gallien_id

    if (!gallienId) {
      return new Response(JSON.stringify({ error: 'gallienId manquant' }), { status: 400 })
    }

    // Client avec service role (acces total, bypass RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // 1. Recuperer la lignee ascendante (N1->N5)
    const { data: lignee, error: ligneeError } = await supabase
      .rpc('get_lignee_ascendante', { p_gallien_id: gallienId })

    if (ligneeError) throw ligneeError
    if (!lignee || lignee.length === 0) {
      return new Response(JSON.stringify({ message: 'Aucun parrain trouve', gallienId }), { status: 200 })
    }

    // Recuperer le prenom du nouveau Gallien pour les notifications
    const { data: nouveauGallien } = await supabase
      .from('galliens')
      .select('prenom, nom, numero_cecg')
      .eq('id', gallienId)
      .single()

    const nomNouveauGallien = nouveauGallien
      ? `${nouveauGallien.prenom} ${nouveauGallien.nom}`
      : 'Un nouveau Gallien'

    // 2. Pour chaque parrain dans la lignee
    const resultats = []
    for (const parrain of lignee) {
      const niveau: number = parrain.niveau
      const parrainId: string = parrain.parrain_id
      const commissionGL = COMMISSIONS[niveau]
      const meritePoints = MERITE_PAR_NIVEAU[niveau]

      if (!commissionGL || !parrainId) continue

      // Verifier que le parrain a une CECG definitive (condition obligatoire)
      const { data: parrainData } = await supabase
        .from('galliens')
        .select('cecg_statut, prenom')
        .eq('id', parrainId)
        .single()

      if (parrainData?.cecg_statut !== 'definitive') continue

      // a. INSERT transaction GL
      const { error: txError } = await supabase
        .from('transactions_gl')
        .insert({
          type: `commission_n${niveau}`,
          expediteur_id: gallienId,
          destinataire_id: parrainId,
          montant_gl: commissionGL,
          merite_genere: meritePoints,
          description: `Commission N${niveau} — ${nomNouveauGallien} a obtenu sa CECG definitive`,
          statut: 'confirme',
        })

      if (txError) {
        console.error(`Erreur transaction N${niveau}:`, txError)
        continue
      }

      // b. Incrementer le merite du parrain
      await supabase.rpc('incrementer_merite', {
        p_gallien_id: parrainId,
        p_points: meritePoints,
        p_categorie: 'commissions',
      })

      // c. INSERT dans matrices_parrainage
      await supabase
        .from('matrices_parrainage')
        .upsert({
          commandeur_id: parrainId,
          filleul_id: gallienId,
          niveau,
          commission_gl: commissionGL,
          merite_genere: meritePoints,
        }, { onConflict: 'commandeur_id,filleul_id' })

      // d. INSERT notification pour le parrain
      await supabase
        .from('notifications')
        .insert({
          gallien_id: parrainId,
          type: 'commission_recue',
          titre: `Commission N${niveau} recue — ${commissionGL.toFixed(2)} GL`,
          message: `${nomNouveauGallien} vient d'obtenir sa Carte Civile Gallienne definitive. Tu recois ${commissionGL.toFixed(2)} GL et ${meritePoints} pts de Merite.`,
          metadata: {
            niveau,
            commission_gl: commissionGL,
            merite_points: meritePoints,
            filleul_id: gallienId,
            filleul_nom: nomNouveauGallien,
          },
        })

      resultats.push({ niveau, parrainId, commissionGL, meritePoints })
    }

    // 3. Incrementer le merite du nouveau Gallien lui-meme (parrainage = inscription)
    await supabase.rpc('incrementer_merite', {
      p_gallien_id: gallienId,
      p_points: 50,
      p_categorie: 'parrainages',
    })

    return new Response(
      JSON.stringify({
        success: true,
        gallienId,
        commissions_distribuees: resultats.length,
        detail: resultats,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Erreur distribuer-commissions:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
