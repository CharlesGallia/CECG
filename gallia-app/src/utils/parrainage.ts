import QRCode from 'qrcode'

/**
 * Génère l'URL de parrainage unique d'un Gallien.
 * Utilise son numero_cecg comme code ref.
 */
export function getLienParrainage(numeroCecg: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://app.gallia.igs'
  return `${base}/?ref=${numeroCecg}`
}

/**
 * Génère un QR code Data URL (PNG base64) à partir d'une URL.
 */
export async function genererQRCode(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 2,
    color: {
      dark: '#111111',
      light: '#FFFFFF',
    },
  })
}

/**
 * Copie une chaîne dans le presse-papiers.
 * Retourne true si succès.
 */
export async function copierDansPresseP(texte: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texte)
    return true
  } catch {
    return false
  }
}
