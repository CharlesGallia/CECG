/**
 * Génère un numéro de Declaratio au format strict :
 *   IGS-DEC-AAAAMMJJ-HHMMSS-NNN
 * où NNN est un compteur incrémental quotidien (UTC) sur 3 chiffres.
 */
const STORAGE_KEY = 'titulus.compteur-jour'

function pad(n: number, len: number): string {
  return String(n).padStart(len, '0')
}

function dateUTCStr(d: Date): { day: string; time: string; ymd: string } {
  const y = d.getUTCFullYear()
  const m = pad(d.getUTCMonth() + 1, 2)
  const j = pad(d.getUTCDate(), 2)
  const hh = pad(d.getUTCHours(), 2)
  const mm = pad(d.getUTCMinutes(), 2)
  const ss = pad(d.getUTCSeconds(), 2)
  return {
    ymd: `${y}-${m}-${j}`,
    day: `${y}${m}${j}`,
    time: `${hh}${mm}${ss}`,
  }
}

export function genererNumeroDeclaratio(date: Date = new Date()): string {
  const { day, time, ymd } = dateUTCStr(date)

  let counter = 1
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as { ymd: string; n: number }
        if (parsed.ymd === ymd) counter = parsed.n + 1
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ymd, n: counter }))
    } catch {
      // ignore localStorage errors (private mode, etc.)
    }
  }

  return `IGS-DEC-${day}-${time}-${pad(counter, 3)}`
}
