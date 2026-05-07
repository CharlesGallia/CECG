/**
 * Helper fetch vers les routes /api/* de Vercel.
 */

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return data as T
}

export type Identite = { prenom: string; nom: string; email: string }

export const titulusApi = {
  saveIdentite: (uuid: string, identite: Identite, hcaptchaToken: string, consents: Record<string, boolean>) =>
    postJson<{ ok: true }>('/api/session/identite', { uuid, ...identite, hcaptchaToken, consents }),

  startStripeCheckout: (uuid: string) =>
    postJson<{ url: string }>('/api/stripe/checkout', { uuid }),

  saveDeclaratio: (uuid: string, declaratio: unknown, primumNonNocere: boolean) =>
    postJson<{ ok: true }>('/api/declaratio/save', { uuid, declaratio, primumNonNocere }),

  signDeclaratio: (uuid: string, numeroDeclaratio: string, signatureDataUrl: string, hcaptchaToken: string, pdfHash?: string) =>
    postJson<{ ok: true }>('/api/declaratio/sign', { uuid, numeroDeclaratio, signatureDataUrl, hcaptchaToken, pdfHash }),

  getKycUploadUrl: (uuid: string, kind: 'recto' | 'selfie' | 'preuve', contentType: string) =>
    postJson<{ uploadUrl: string; token: string; path: string }>('/api/kyc/upload-url', { uuid, kind, contentType }),

  transmitKyc: (uuid: string, paths: { recto: string; selfie: string; preuve: string }) =>
    postJson<{ ok: true }>('/api/kyc/transmit', { uuid, paths }),
}
