const MOIS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]

export function formatDateFR(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MOIS_FR[m - 1]} ${y}`
}

export function aujourdhuiISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function calculerAge(isoNaissance: string): number {
  if (!isoNaissance) return 0
  const naiss = new Date(isoNaissance)
  if (Number.isNaN(naiss.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - naiss.getFullYear()
  const m = now.getMonth() - naiss.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < naiss.getDate())) age--
  return age
}
