import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Tree from 'react-d3-tree'
import type { RawNodeDatum, CustomNodeElementProps } from 'react-d3-tree'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useReseau } from '../hooks/useReseau'
import PageLayout from '../components/PageLayout'
import Card from '../components/Card'
import Badge from '../components/Badge'
import GoldRule from '../components/GoldRule'

interface NoeudGallien {
  niveau: number
  filleul_id: string
  prenom: string
  nom: string
  cecg_statut: string
  numero_cecg: string | null
}

interface DetailFilleul {
  id: string
  prenom: string
  nom: string
  cecg_statut: string
  numero_cecg: string | null
  rang: string
  created_at: string
}

// Convertit la liste plate en arbre hiérarchique pour react-d3-tree
function buildTreeData(
  gallien: { prenom: string; numero_cecg: string | null },
  reseau: NoeudGallien[]
): RawNodeDatum {
  const byParent: Record<string, NoeudGallien[]> = {}

  // Niveau 1 : filleuls directs
  reseau.filter((n) => n.niveau === 1).forEach((n) => {
    if (!byParent['root']) byParent['root'] = []
    byParent['root'].push(n)
  })

  // Niveaux 2-5 : on ne peut pas reconstruire le parent exact sans la table,
  // donc on group par niveau comme filleuls du dernier niveau précédent
  for (let lvl = 2; lvl <= 5; lvl++) {
    reseau.filter((n) => n.niveau === lvl).forEach((n) => {
      // Chercher un parent possible au niveau précédent (approximation)
      const parentPossible = reseau.find((p) => p.niveau === lvl - 1)
      const parentKey = parentPossible?.filleul_id ?? 'root'
      if (!byParent[parentKey]) byParent[parentKey] = []
      byParent[parentKey].push(n)
    })
  }

  const buildNode = (node: NoeudGallien): RawNodeDatum => ({
    name: node.prenom,
    attributes: {
      id: node.filleul_id,
      statut: node.cecg_statut,
      numero: node.numero_cecg ?? '',
      niveau: String(node.niveau),
    },
    children: (byParent[node.filleul_id] ?? []).map(buildNode),
  })

  return {
    name: gallien.prenom,
    attributes: { id: 'self', statut: 'self', numero: gallien.numero_cecg ?? '', niveau: '0' },
    children: (byParent['root'] ?? []).map(buildNode),
  }
}

// Factory qui cree le composant noeud avec le callback injecte par closure
function makeNoeudCustom(onNodeClick: (id: string) => void) {
  return function NoeudCustom({ nodeDatum }: CustomNodeElementProps) {
    const statut = String(nodeDatum.attributes?.statut ?? '')
    const isSelf = statut === 'self'
    const isDefinitive = statut === 'definitive'
    const id = String(nodeDatum.attributes?.id ?? '')
    const initial = nodeDatum.name?.[0]?.toUpperCase() ?? '?'

    const fillColor = isSelf ? '#B8960C' : isDefinitive ? '#22c55e' : '#9ca3af'
    const strokeColor = isSelf ? '#7A620A' : isDefinitive ? '#16a34a' : '#d1d5db'
    const textColor = '#111111'

  return (
    <g
      onClick={() => !isSelf && onNodeClick(id)}
      style={{ cursor: isSelf ? 'default' : 'pointer' }}
    >
      <circle r={22} fill={fillColor} stroke={strokeColor} strokeWidth={2} />
      <text
        fill="#FFFFFF"
        fontSize={14}
        fontWeight="bold"
        fontFamily="Playfair Display, serif"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {initial}
      </text>
      <text
        fill={textColor}
        fontSize={11}
        fontFamily="Inter, sans-serif"
        textAnchor="middle"
        y={36}
      >
        {nodeDatum.name}
      </text>
    </g>
  )
  }
}

export default function CercleGallien() {
  const { gallien, loading, isAuthenticated } = useAuth()
  const { reseau, stats, loading: reseauLoading } = useReseau(gallien?.id)
  const navigate = useNavigate()

  const [treeData, setTreeData] = useState<RawNodeDatum | null>(null)
  const [selected, setSelected] = useState<DetailFilleul | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate('/')
  }, [loading, isAuthenticated, navigate])

  // Adapter les dimensions au container
  useEffect(() => {
    const update = () => setDimensions({ width: window.innerWidth - 320, height: Math.max(window.innerHeight - 280, 400) })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Construire l'arbre quand le reseau est chargé
  useEffect(() => {
    if (!gallien || reseauLoading) return
    setTreeData(buildTreeData({ prenom: gallien.prenom, numero_cecg: gallien.numero_cecg }, reseau))
  }, [gallien, reseau, reseauLoading])

  const handleNodeClick = useCallback(async (id: string) => {
    if (id === 'self' || !id) return
    setLoadingDetail(true)
    const { data } = await supabase
      .from('galliens')
      .select('id, prenom, nom, cecg_statut, numero_cecg, rang, created_at')
      .eq('id', id)
      .single()
    if (data) setSelected(data as DetailFilleul)
    setLoadingDetail(false)
  }, [])

  if (loading) return null

  return (
    <PageLayout withSidebar>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-noir mb-1">Mon Cercle</h1>
        <p className="font-body text-sm text-gris-texte">
          Ton reseau de parrainage jusqu'au niveau 5
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'N1', value: stats?.count_n1 ?? 0 },
          { label: 'N2', value: stats?.count_n2 ?? 0 },
          { label: 'N3', value: stats?.count_n3 ?? 0 },
          { label: 'N4', value: stats?.count_n4 ?? 0 },
          { label: 'N5', value: stats?.count_n5 ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-blanc border border-gris rounded-sm p-3 text-center">
            <p className="font-display text-xl font-bold text-noir">{value}</p>
            <p className="font-body text-xs text-gris-texte">Niveau {label}</p>
          </div>
        ))}
      </div>

      {/* Legende */}
      <div className="flex items-center gap-5 mb-4">
        {[
          { color: '#B8960C', label: 'Moi' },
          { color: '#22c55e', label: 'Definitive' },
          { color: '#9ca3af', label: 'Provisoire' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="font-body text-xs text-gris-texte">{label}</span>
          </div>
        ))}
        <p className="font-body text-xs text-gris-texte ml-auto italic">
          Cliquer sur un noeud pour voir le profil
        </p>
      </div>

      {/* Arbre */}
      <div className="bg-blanc border border-gris rounded-sm overflow-hidden" style={{ height: 480 }}>
        {reseauLoading || !treeData ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin" />
              <p className="font-body text-sm text-gris-texte">Chargement du reseau...</p>
            </div>
          </div>
        ) : reseau.length === 0 ? (
          <div className="flex items-center justify-center h-full flex-col gap-3">
            <div className="w-16 h-16 rounded-full bg-or-clair border border-or flex items-center justify-center">
              <span className="font-display text-2xl font-bold text-or">
                {gallien?.prenom?.[0]?.toUpperCase()}
              </span>
            </div>
            <p className="font-body text-sm text-gris-texte text-center max-w-xs">
              Ton cercle est vide pour l'instant. Partage ton lien de parrainage pour voir ton reseau grandir ici.
            </p>
          </div>
        ) : (
          <Tree
            data={treeData}
            orientation="vertical"
            dimensions={dimensions}
            translate={{ x: dimensions.width / 2, y: 60 }}
            pathFunc="step"
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            nodeSize={{ x: 120, y: 100 }}
            renderCustomNodeElement={makeNoeudCustom(handleNodeClick)}
            zoom={0.8}
            scaleExtent={{ min: 0.3, max: 1.5 }}
            draggable
            zoomable
          />
        )}
      </div>

      {/* Panneau detail filleul */}
      {(selected || loadingDetail) && (
        <Card className="mt-5" padding="md">
          {loadingDetail ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-or border-t-transparent rounded-full animate-spin" />
              <p className="font-body text-sm text-gris-texte">Chargement...</p>
            </div>
          ) : selected && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-or-clair border border-or flex items-center justify-center shrink-0">
                    <span className="font-display text-lg font-bold text-or-fonce">
                      {selected.prenom[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-noir">
                      {selected.prenom} {selected.nom}
                    </p>
                    {selected.numero_cecg && (
                      <p className="font-body text-xs text-gris-texte tracking-wider">{selected.numero_cecg}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="font-body text-xs text-gris-texte hover:text-noir transition-colors shrink-0"
                >
                  Fermer
                </button>
              </div>
              <GoldRule className="my-3" />
              <div className="flex flex-wrap gap-2">
                <Badge type="rang-merite">{selected.rang}</Badge>
                <Badge type="statut-cecg">{selected.cecg_statut}</Badge>
              </div>
              <p className="font-body text-xs text-gris-texte mt-3">
                Inscrit le {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </>
          )}
        </Card>
      )}
    </PageLayout>
  )
}
