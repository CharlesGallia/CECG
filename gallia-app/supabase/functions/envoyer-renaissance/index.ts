/**
 * Edge Function : envoyer-renaissance
 * Envoie l'email Acte de Renaissance avec le lien CECG tokenise via Resend.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { gallienId, prenom } = await req.json()
    if (!gallienId) throw new Error('gallienId manquant')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // Recuperer email du Gallien
    const { data: gallien } = await supabase
      .from('galliens')
      .select('email, prenom')
      .eq('id', gallienId)
      .single()

    if (!gallien) throw new Error('Gallien introuvable')

    // Generer un lien magique Supabase Auth (valable 3 mois = 7776000 secondes)
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: gallien.email,
      options: {
        redirectTo: `${Deno.env.get('APP_URL') ?? 'https://app.gallia.igs'}/cecg`,
        expiresIn: 7776000,
      },
    })

    const lienCECG = linkData?.properties?.action_link ?? `${Deno.env.get('APP_URL')}/cecg`

    // Envoyer via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY manquante')

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Gallia IGS <noreply@gallia.igs>',
        to: gallien.email,
        subject: `Acte de Renaissance — Bienvenue dans Gallia, ${gallien.prenom}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #FFFFFF; color: #111111; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; padding: 0 24px; }
    .header { text-align: center; padding: 40px 0 32px; border-bottom: 1px solid #B8960C; }
    .logo { font-size: 13px; letter-spacing: 4px; text-transform: uppercase; color: #B8960C; margin-bottom: 16px; }
    h1 { font-size: 32px; font-weight: bold; color: #111111; margin: 0 0 8px; }
    .rule { width: 48px; height: 2px; background: #B8960C; margin: 16px auto; }
    .body { padding: 32px 0; }
    p { font-size: 15px; line-height: 1.7; color: #111111; margin: 0 0 16px; }
    .cta { display: block; margin: 32px auto; padding: 16px 32px; background: #111111; color: #FFFFFF; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; font-weight: 600; text-align: center; border-radius: 2px; }
    .note { font-size: 12px; color: #666666; text-align: center; margin-top: 8px; }
    .footer { border-top: 1px solid #E5E5E5; padding: 24px 0; text-align: center; }
    .devise { font-style: italic; font-size: 13px; color: #666666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Imperio Gallorum Sociatis</div>
      <h1>Acte de Renaissance</h1>
      <div class="rule"></div>
    </div>
    <div class="body">
      <p>Cher(e) ${gallien.prenom},</p>
      <p>
        Ton Serment Gallien a ete enregistre. Tu es desormais reconnu(e) par la communaute
        comme un membre en devenir de Gallia.
      </p>
      <p>
        Pour obtenir ta Carte Civile Gallienne, clique sur le lien ci-dessous et
        choisis ton chemin d'adhesion. Ce lien est personnel et valable <strong>3 mois</strong>.
      </p>
      <a class="cta" href="${lienCECG}">Obtenir ma Carte Civile Gallienne</a>
      <p class="note">Ce lien expire dans 3 mois. Ne le partage pas.</p>
      <p>
        Si tu n'es pas a l'origine de cette demande, ignore simplement cet email.
        Aucune action ne sera entreprise.
      </p>
    </div>
    <div class="footer">
      <p class="devise">Soveregnitas non negotiatur. Exercetur.</p>
    </div>
  </div>
</body>
</html>
        `.trim(),
      }),
    })

    if (!emailRes.ok) {
      const errBody = await emailRes.text()
      throw new Error(`Resend error: ${errBody}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('envoyer-renaissance error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
