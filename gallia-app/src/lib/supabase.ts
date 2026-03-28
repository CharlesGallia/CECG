import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

export type Database = {
  public: {
    Tables: {
      galliens: {
        Row: {
          id: string
          numero_cecg: string | null
          prenom: string
          nom: string
          email: string
          pays: string | null
          parrain_id: string | null
          serment_signe: boolean
          serment_date: string | null
          kyc_hash_zk: string | null
          kyc_valide: boolean
          cecg_statut: 'aucune' | 'provisoire_solidaire' | 'provisoire_parrainage' | 'definitive'
          cecg_date: string | null
          cecg_chemin: 'standard' | 'solidaire' | 'parrainage' | null
          rang: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['galliens']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['galliens']['Insert']>
      }
      merite_gallien: {
        Row: {
          id: string
          gallien_id: string
          points_total: number
          points_parrainages: number
          points_commissions: number
          points_missions: number
          points_anciennete: number
          rang_merite: string
        }
        Insert: Omit<Database['public']['Tables']['merite_gallien']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['merite_gallien']['Insert']>
      }
      transactions_gl: {
        Row: {
          id: string
          type: string
          expediteur_id: string | null
          destinataire_id: string | null
          montant_gl: number
          merite_genere: number
          description: string | null
          statut: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions_gl']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['transactions_gl']['Insert']>
      }
      matrices_parrainage: {
        Row: {
          id: string
          commandeur_id: string
          filleul_id: string
          niveau: number
          commission_gl: number
          merite_genere: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['matrices_parrainage']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['matrices_parrainage']['Insert']>
      }
      cecg_solidaire: {
        Row: {
          id: string
          gallien_id: string
          justificatif_type: string | null
          justificatif_url: string | null
          statut: 'en_attente' | 'valide' | 'refuse'
          parrainages_count: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cecg_solidaire']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cecg_solidaire']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          gallien_id: string
          type: string
          titre: string
          message: string
          lue: boolean
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
    Functions: {
      incrementer_merite: {
        Args: { p_gallien_id: string; p_points: number; p_categorie: string }
        Returns: void
      }
      get_lignee_ascendante: {
        Args: { p_gallien_id: string }
        Returns: Array<{ niveau: number; parrain_id: string; prenom: string; nom: string; numero_cecg: string }>
      }
      get_reseau_descendant: {
        Args: { p_gallien_id: string }
        Returns: Array<{ niveau: number; filleul_id: string; prenom: string; nom: string; cecg_statut: string }>
      }
      get_stats_reseau: {
        Args: { p_gallien_id: string }
        Returns: {
          count_n1: number; count_n2: number; count_n3: number; count_n4: number; count_n5: number
          total_reseau: number; commissions_total_gl: number; commissions_mois_gl: number
        }
      }
      generer_numero_cecg: {
        Args: { gallienId: string }
        Returns: string
      }
    }
  }
}
