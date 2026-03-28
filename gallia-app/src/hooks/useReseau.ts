import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface StatsReseau {
  count_n1: number
  count_n2: number
  count_n3: number
  count_n4: number
  count_n5: number
  total_reseau: number
  commissions_total_gl: number
  commissions_mois_gl: number
}

interface NoeudReseau {
  niveau: number
  filleul_id: string
  prenom: string
  nom: string
  cecg_statut: string
  numero_cecg: string | null
}

export function useReseau(gallienId: string | undefined) {
  const [stats, setStats] = useState<StatsReseau | null>(null)
  const [reseau, setReseau] = useState<NoeudReseau[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReseau = useCallback(async () => {
    if (!gallienId) return

    const [statsRes, reseauRes] = await Promise.all([
      supabase.rpc('get_stats_reseau', { p_gallien_id: gallienId }),
      supabase.rpc('get_reseau_descendant', { p_gallien_id: gallienId }),
    ])

    if (statsRes.data) setStats(statsRes.data as unknown as StatsReseau)
    if (reseauRes.data) setReseau(reseauRes.data as NoeudReseau[])
    setLoading(false)
  }, [gallienId])

  useEffect(() => {
    fetchReseau()

    if (!gallienId) return

    // Realtime : nouveau filleul inscrit → refresh
    const channel = supabase
      .channel(`reseau-${gallienId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'galliens', filter: `parrain_id=eq.${gallienId}` },
        () => fetchReseau()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [gallienId, fetchReseau])

  return { stats, reseau, loading, refetch: fetchReseau }
}
