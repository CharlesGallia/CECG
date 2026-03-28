/**
 * KYC Souverain — traitement 100% côté client
 * RÈGLE ABSOLUE : aucune image, aucune donnée biométrique n'est envoyée au serveur
 * Seul le hash SHA-256 est stocké dans Supabase
 */

/**
 * Génère un hash SHA-256 à partir des 4 champs d'identité.
 * Retourne une string hexadécimale de 64 caractères.
 */
export async function genererHashZK(
  prenom: string,
  nom: string,
  dateNaissance: string,
  lieuNaissance: string
): Promise<string> {
  const data = [prenom, nom, dateNaissance, lieuNaissance]
    .map((s) => s.trim().toLowerCase())
    .join('|')

  const encoder = new TextEncoder()
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  const hashArray = Array.from(new Uint8Array(buffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Parse le texte OCR pour extraire les 4 champs d'identité.
 * Tente de détecter les patterns courants des CNI françaises et passeports.
 */
export function parseTexteOCR(texte: string): {
  prenom: string
  nom: string
  dateNaissance: string
  lieuNaissance: string
} {
  const lines = texte
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  let prenom = ''
  let nom = ''
  let dateNaissance = ''
  let lieuNaissance = ''

  // Patterns date de naissance
  const datePatterns = [
    /n[eé][e]?\s+le\s+(\d{1,2}[\s./]\d{1,2}[\s./]\d{2,4})/i,
    /date\s+de\s+naissance\s*:?\s*(\d{1,2}[\s./]\d{1,2}[\s./]\d{2,4})/i,
    /(\d{2}[\s./]\d{2}[\s./]\d{4})/,
  ]

  // Patterns lieu de naissance
  const lieuPatterns = [
    /n[eé][e]?\s+[àa]\s+([A-ZÀ-Ÿa-zà-ÿ\s-]+)/i,
    /lieu\s+de\s+naissance\s*:?\s*([A-ZÀ-Ÿa-zà-ÿ\s-]+)/i,
    /[àa]\s+([A-ZÀ-Ÿ][A-ZÀ-Ÿa-zà-ÿ\s-]{2,})/,
  ]

  // Patterns nom/prénom
  const nomPatterns = [
    /nom\s*:?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-zà-ÿ\s-]+)/i,
    /surname\s*:?\s*([A-Z][A-Za-z\s-]+)/i,
  ]

  const prenomPatterns = [
    /pr[eé]nom\s*:?\s*([A-ZÀ-Ÿ][A-ZÀ-Ÿa-zà-ÿ\s-]+)/i,
    /given\s+name\s*:?\s*([A-Z][A-Za-z\s-]+)/i,
    /first\s+name\s*:?\s*([A-Z][A-Za-z\s-]+)/i,
  ]

  const fullText = lines.join(' ')

  for (const p of datePatterns) {
    const m = fullText.match(p)
    if (m) { dateNaissance = m[1].trim(); break }
  }

  for (const p of lieuPatterns) {
    const m = fullText.match(p)
    if (m) { lieuNaissance = m[1].trim().replace(/\s+/g, ' '); break }
  }

  for (const p of nomPatterns) {
    const m = fullText.match(p)
    if (m) { nom = m[1].trim(); break }
  }

  for (const p of prenomPatterns) {
    const m = fullText.match(p)
    if (m) { prenom = m[1].trim(); break }
  }

  // Fallback : lignes en majuscules souvent = NOM PRÉNOM sur CNI
  if (!nom || !prenom) {
    const majLines = lines.filter((l) => /^[A-ZÀ-Ÿ\s-]{3,}$/.test(l) && l.length > 2)
    if (majLines.length >= 1 && !nom) nom = majLines[0]
    if (majLines.length >= 2 && !prenom) prenom = majLines[1]
  }

  return { prenom, nom, dateNaissance, lieuNaissance }
}

/**
 * Arrête tous les tracks d'un MediaStream (coupe la caméra).
 */
export function arreterCamera(stream: MediaStream | null): void {
  if (!stream) return
  stream.getTracks().forEach((track) => track.stop())
}
