/**
 * Vérification hCaptcha côté serveur.
 * Appelé par /api/session/identite et /api/declaratio/sign.
 */
export async function verifyHcaptcha(token: string, remoteip?: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET ?? ''
  if (!secret) {
    console.warn('[Titulus] HCAPTCHA_SECRET missing — verification disabled (dev mode).')
    return token.startsWith('stub-') // accepte les stubs en dev
  }
  if (!token) return false

  const body = new URLSearchParams({
    secret,
    response: token,
    ...(remoteip ? { remoteip } : {}),
  })

  try {
    const res = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const json = (await res.json()) as { success?: boolean }
    return json.success === true
  } catch (err) {
    console.error('[Titulus] hCaptcha verification error:', err)
    return false
  }
}
