/**
 * Helper Resend — envois e-mails transactionnels.
 */
import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY ?? ''
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Imperio Gallorum Sociatis <noreply@gallia.space>'

const resend = apiKey ? new Resend(apiKey) : null

type SendArgs = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendArgs): Promise<void> {
  if (!resend) {
    console.warn('[Titulus] Resend not configured — skipping email to', to)
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[Titulus] Resend send failed:', err)
  }
}

/** Template e-mail — entête doré + corps charcoal sur parchemin. */
export function imperialEmailHtml(opts: { titre: string; corps: string; cta?: { label: string; href: string } }): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Georgia,'Cormorant Garamond',serif;color:#1E2A3B;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A0A;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#F4ECD8;border:1px solid #C9A84C;max-width:600px;">
        <tr><td style="padding:24px 32px;text-align:center;border-bottom:1px solid rgba(201,168,76,0.5);">
          <div style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:3px;color:#1E2A3B;font-weight:700;">
            IMPERIO GALLORUM SOCIATIS
          </div>
          <div style="font-size:11px;color:#5A4D2A;margin-top:4px;">CONSULAT DE GALLIA · GIFTER · SIREN 533 624 649</div>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="font-family:'Cinzel',serif;font-size:22px;color:#1E2A3B;margin:0 0 16px;letter-spacing:1px;">${opts.titre}</h1>
          <div style="font-size:16px;line-height:1.7;color:#1E2A3B;">${opts.corps}</div>
          ${opts.cta ? `<div style="text-align:center;margin-top:28px;">
            <a href="${opts.cta.href}" style="display:inline-block;background:#C9A84C;color:#0A0A0A;font-family:'Cinzel',serif;text-transform:uppercase;letter-spacing:2px;padding:14px 28px;text-decoration:none;font-weight:600;font-size:14px;">${opts.cta.label}</a>
          </div>` : ''}
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid rgba(201,168,76,0.4);text-align:center;font-size:11px;color:#5A4D2A;letter-spacing:1px;">
          Association GIFTER · SIREN 533 624 649 · 8 Route du Minerai, Menestreau · <em>Gallia Aeterna</em>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
