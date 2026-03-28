/**
 * Edge Function : envoyer-cecg
 * Genere la CECG PDF cote serveur et l'envoie par email via Resend.
 * JAMAIS de donnees sensibles dans le PDF (pas de DDN, pas de num de piece).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, rgb, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1'

const OR  = rgb(0.722, 0.588, 0.047)
const NOIR = rgb(0.067, 0.067, 0.067)

async function generateCECGPdf(data: {
  prenom: string; nom: string; numeroCecg: string
  rang: string; statut: string; dateEmission: string; dateExpiration?: string
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const W = 242, H = 153
  const page = doc.addPage([W, H])
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const reg  = await doc.embedFont(StandardFonts.Helvetica)
  const ital = await doc.embedFont(StandardFonts.HelveticaOblique)

  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1,1,1) })
  page.drawRectangle({ x: 1.5, y: 1.5, width: W-3, height: H-3, borderColor: OR, borderWidth: 1.5, color: rgb(1,1,1) })

  const cx = (text: string, font: typeof bold, size: number) =>
    W/2 - font.widthOfTextAtSize(text, size)/2

  page.drawText('IGS', { x: cx('IGS', bold, 9), y: H-18, size: 9, font: bold, color: NOIR })
  page.drawText('Imperio Gallorum Sociatis', { x: cx('Imperio Gallorum Sociatis', ital, 6), y: H-26, size: 6, font: ital, color: OR })
  page.drawLine({ start: {x:20,y:H-32}, end: {x:W-20,y:H-32}, thickness: 0.75, color: OR })

  const titre = 'CARTE CIVILE GALLIENNE'
  page.drawText(titre, { x: cx(titre, bold, 7.5), y: H-43, size: 7.5, font: bold, color: NOIR })

  const nom = `${data.prenom.toUpperCase()} ${data.nom.toUpperCase()}`
  const sz = nom.length > 22 ? 11 : 14
  page.drawText(nom, { x: cx(nom, bold, sz), y: H-62, size: sz, font: bold, color: NOIR })
  page.drawText(data.numeroCecg, { x: cx(data.numeroCecg, reg, 8), y: H-74, size: 8, font: reg, color: OR })
  page.drawText(data.rang.toUpperCase(), { x: cx(data.rang.toUpperCase(), bold, 7), y: H-85, size: 7, font: bold, color: NOIR })

  page.drawLine({ start: {x:20,y:H-92}, end: {x:W-20,y:H-92}, thickness: 0.5, color: OR })

  const label = data.statut === 'definitive' ? 'Carte Definitive' : 'Carte Provisoire'
  page.drawText(label, { x: 20, y: H-103, size: 7, font: bold, color: data.statut === 'definitive' ? OR : NOIR })
  page.drawText(`Emise le ${data.dateEmission}`, { x: 20, y: H-113, size: 6.5, font: reg, color: NOIR })
  if (data.dateExpiration) {
    page.drawText(`Valable jusqu'au ${data.dateExpiration}`, { x: 20, y: H-122, size: 6, font: ital, color: rgb(0.6,0.4,0) })
  }

  const devise = 'SOVEREGNITAS NON NEGOTIATUR. EXERCETUR.'
  page.drawText(devise, { x: cx(devise, ital, 4.5), y: 8, size: 4.5, font: ital, color: rgb(0.5,0.5,0.5) })

  return doc.save()
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { gallienId } = await req.json()
    if (!gallienId) throw new Error('gallienId manquant')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    const { data: gallien } = await supabase
      .from('galliens')
      .select('prenom, nom, email, numero_cecg, rang, cecg_statut, cecg_date')
      .eq('id', gallienId)
      .single()

    if (!gallien || !gallien.numero_cecg) throw new Error('Gallien ou numero CECG manquant')

    const today = new Date()
    const fmt = (d: Date) => d.toLocaleDateString('fr-FR')
    const dateEmission = gallien.cecg_date ? fmt(new Date(gallien.cecg_date)) : fmt(today)
    const dateExpiration = gallien.cecg_statut !== 'definitive'
      ? fmt(new Date(today.setMonth(today.getMonth() + 6)))
      : undefined

    const pdfBytes = await generateCECGPdf({
      prenom: gallien.prenom,
      nom: gallien.nom,
      numeroCecg: gallien.numero_cecg,
      rang: gallien.rang,
      statut: gallien.cecg_statut,
      dateEmission,
      dateExpiration,
    })

    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes))
    const appUrl = Deno.env.get('APP_URL') ?? 'https://app.gallia.igs'
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY manquante')

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Gallia IGS <noreply@gallia.igs>',
        to: gallien.email,
        subject: `Ta Carte Civile Gallienne — ${gallien.numero_cecg}`,
        html: `
<div style="font-family:Georgia,serif;max-width:560px;margin:40px auto;color:#111">
  <div style="text-align:center;border-bottom:1px solid #B8960C;padding-bottom:24px;margin-bottom:24px">
    <p style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#B8960C;margin:0 0 12px">IGS</p>
    <h1 style="font-size:28px;margin:0 0 4px">Ta Carte Civile Gallienne</h1>
    <p style="color:#666;font-size:13px;margin:0">${gallien.numero_cecg}</p>
  </div>
  <p>Bonjour ${gallien.prenom},</p>
  <p>Ta Carte Civile Gallienne est prete. Tu la trouveras en piece jointe de cet email.</p>
  <p>Tu peux egalement la telecharger depuis ton <a href="${appUrl}/profil" style="color:#B8960C">espace personnel</a>.</p>
  <p>Pour verifier l'authenticite de ta carte, utilise le lien :<br>
    <a href="${appUrl}/verifier/${gallien.numero_cecg}" style="color:#B8960C">
      ${appUrl}/verifier/${gallien.numero_cecg}
    </a>
  </p>
  <hr style="border:none;border-top:1px solid #E5E5E5;margin:24px 0">
  <p style="font-style:italic;color:#666;font-size:13px;text-align:center">
    Soveregnitas non negotiatur. Exercetur.
  </p>
</div>`,
        attachments: [{
          filename: `CECG-${gallien.numero_cecg}.pdf`,
          content: pdfBase64,
        }],
      }),
    })

    if (!emailRes.ok) throw new Error(`Resend: ${await emailRes.text()}`)

    return new Response(JSON.stringify({ success: true, numero: gallien.numero_cecg }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('envoyer-cecg error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
