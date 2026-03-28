import { useEffect, useState, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Gallien = Database['public']['Tables']['galliens']['Row']

interface AuthState {
  session: Session | null
  user: User | null
  gallien: Gallien | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    gallien: null,
    loading: true,
    error: null,
  })

  const fetchGallien = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('galliens')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      setState((s) => ({ ...s, gallien: null, error: error.message }))
    } else {
      setState((s) => ({ ...s, gallien: data, error: null }))
    }
  }, [])

  useEffect(() => {
    // Récupère la session courante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((s) => ({
        ...s,
        session,
        user: session?.user ?? null,
        loading: false,
      }))
      if (session?.user) fetchGallien(session.user.id)
    })

    // Écoute les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState((s) => ({
          ...s,
          session,
          user: session?.user ?? null,
          loading: false,
        }))
        if (session?.user) {
          fetchGallien(session.user.id)
        } else {
          setState((s) => ({ ...s, gallien: null }))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchGallien])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const refreshGallien = useCallback(() => {
    if (state.user) fetchGallien(state.user.id)
  }, [state.user, fetchGallien])

  return {
    ...state,
    isAuthenticated: !!state.session,
    signOut,
    refreshGallien,
  }
}
