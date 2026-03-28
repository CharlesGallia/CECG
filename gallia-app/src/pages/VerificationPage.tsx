/**
 * Page de verification publique d'une CECG.
 * Accessible sans connexion.
 * N'affiche JAMAIS le nom ni aucune donnee personnelle.
 */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, XCircle, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import GoldRule from '../components/GoldRule'

interface CECGPublique {
  numero_cecg: string
  rang: string
  cecg_date: string | null
  cecg_statut: string
}

export default function VerificationPage() {
  const { numero } = useParams<{ numero: string }>()
  const [data, setData] = useState<CECGPublique | null>(null)
  const [loading, setLoading] = useState(true)
  const [found, setFound] = useState(false)

  useEffect(() => {
    if (!numero) return
    supabase
      .from('galliens')
      .select('numero_cecg, rang, cecg_date, cecg_statut')
      .eq('numero_cecg', numero)
      .single()
      .then(({ data: row }) => {
        if (row) { setData(row as CECGPublique); setFound(true) }
        setLoading(false)
      })
  }, [numero])

  return (
    <div className="min-h-screen bg-blanc flex flex-col items-center justify-center px-4 py-20">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-or mb-4">
          Imperio Gallorum Sociatis
        </p>
        <h1 className="font-display text-3xl font-bold text-noir mb-2">
          Verification CECG
        </h1>
        <GoldRule width="48px" thickness={2} centered />
      </div>

      <div className="w-full max-w-sm">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin" />
          </div>
        ) : found && data ? (
          <div className="bg-blanc border border-or rounded-sm p-6 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-or-clair border border-or flex items-center justify-center">
                <CheckCircle size={28} className="text-or" />
              </div>
            </div>

            <p className="font-body text-xs text-or font-semibold uppercase tracking-widest mb-2">
              Carte Valide
            </p>
            <p className="font-display text-xl font-bold text-noir mb-1">
              {data.numero_cecg}
            </p>
            <GoldRule className="my-4" />

            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="font-body text-xs text-gris-texte">Rang</span>
                <span className="font-body text-xs font-semibold text-noir">{data.rang}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-xs text-gris-texte">Statut</span>
                <span className={`font-body text-xs font-semibold ${
                  data.cecg_statut === 'definitive' ? 'text-or' : 'text-amber-600'
                }`}>
                  {data.cecg_statut === 'definitive' ? 'Definitive' : 'Provisoire'}
                </span>
              </div>
              {data.cecg_date && (
                <div className="flex justify-between">
                  <span className="font-body text-xs text-gris-texte">Emise le</span>
                  <span className="font-body text-xs text-noir">
                    {new Date(data.cecg_date).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 px-3 py-2 bg-gris-clair rounded-sm">
              <Shield size={12} className="text-gris-texte" />
              <p className="font-body text-[10px] text-gris-texte">
                Verification effectuee par IGS — aucune donnee personnelle affichee
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-blanc border border-red-200 rounded-sm p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
                <XCircle size={28} className="text-red-400" />
              </div>
            </div>
            <p className="font-display text-lg font-semibold text-noir mb-2">
              Carte introuvable
            </p>
            <p className="font-body text-sm text-gris-texte">
              Le numero{' '}
              <span className="font-mono text-noir">{numero}</span>{' '}
              ne correspond a aucune Carte Civile Gallienne valide.
            </p>
          </div>
        )}

        <p className="text-center font-display text-xs text-gris-texte italic mt-8">
          Soveregnitas non negotiatur. Exercetur.
        </p>
      </div>
    </div>
  )
}
