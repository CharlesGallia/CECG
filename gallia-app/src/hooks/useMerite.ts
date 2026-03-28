import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type MeriteRow = Database['public']['Tables']['merite_gallien']['Row']

export const RANGS_MERITE = [
  { rang: 'Semence',       min: 0,     max: 499 },
  { rang: 'Pousse',        min: 500,   max: 1999 },
  { rang: 'Racine',        min: 2000,  max: 4999 },
  { rang: 'Arbre',         min: 5000,  max: 14999 },
  { rang: 'Chêne Gallien', min: 15000, max: 49999 },
  { rang: 'Forêt',         min: 50000, max: Infinity },
]

export function getRangSuivant(points: number) {
  const idx = RANGS_MERITE.findIndex((r) => points <= r.max)
  const courant = RANGS_MERITE[Math.max(idx, 0)]
  const suivant = RANGS_MERITE[idx + 1] ?? null
  const progressPct = suivant
    ? Math.min(((points - courant.min) / (courant.max + 1 - courant.min)) * 100, 100)
    : 100
  return { courant, suivant, progressPct }
}

export function useMerite(gallienId: string | undefined) {
  const [merite, setMerite] = useState<MeriteRow | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMerite = useCallback(async () => {
    if (!gallienId) return
    const { data } = await supabase
      .from('merite_gallien')
      .select('*')
      .eq('gallien_id', gallienId)
      .single()
    if (data) setMerite(data)
    setLoading(false)
  }, [gallienId])

  useEffect(() => {
    fetchMerite()

    if (!gallienId) return

    // Realtime : mise à jour du mérite en temps réel
    const channel = supabase
      .channel(`merite-${gallienId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'merite_gallien', filter: `gallien_id=eq.${gallienId}` },
        (payload) => setMerite(payload.new as MeriteRow)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gallienId, fetchMerite])

  return { merite, loading, refetch: fetchMerite }
}
