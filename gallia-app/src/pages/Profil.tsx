import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Copy, Check, Shield, LogOut, Trash2, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMerite } from '../hooks/useMerite'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import Badge from '../components/Badge'
import GoldRule from '../components/GoldRule'
import { generateCECGPdf, downloadPdf } from '../utils/cecg'
import { getLienParrainage, genererQRCode, copierDansPresseP } from '../utils/parrainage'

export default function Profil() {
  const { gallien, loading, isAuthenticated, signOut, refreshGallien } = useAuth()
  const navigate = useNavigate()
  const { merite } = useMerite(gallien?.id)

  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [copied, setCopied] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!loading && !isAuthenticated) { navigate('/'); return null }
  if (!gallien) return null

  const lien = gallien.numero_cecg ? getLienParrainage(gallien.numero_cecg) : ''
  const initial = gallien.prenom?.[0]?.toUpperCase() ?? '?'

  // --- Telecharger CECG PDF ---
  const handleDownloadCECG = useCallback(async () => {
    if (!gallien.numero_cecg) return
    setGeneratingPdf(true)
    try {
      const verifyUrl = `${window.location.origin}/verifier/${gallien.numero_cecg}`
      const qrDataUrl = await genererQRCode(verifyUrl)

      const today = new Date()
      const dateEmission = today.toLocaleDateString('fr-FR')
      const dateExpiration = gallien.cecg_statut !== 'definitive'
        ? new Date(today.setMonth(today.getMonth() + 6)).toLocaleDateString('fr-FR')
        : undefined

      const bytes = await generateCECGPdf({
        prenom: gallien.prenom,
        nom: gallien.nom,
        numeroCecg: gallien.numero_cecg,
        rang: gallien.rang,
        statut: gallien.cecg_statut === 'definitive' ? 'Definitive' : 'Provisoire',
        dateEmission,
        dateExpiration,
        qrDataUrl,
      })
      downloadPdf(bytes, `CECG-${gallien.numero_cecg}.pdf`)
    } finally {
      setGeneratingPdf(false)
    }
  }, [gallien])

  // --- Copier lien ---
  const handleCopyLien = async () => {
    await copierDansPresseP(lien)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Sauvegarder email/mdp ---
  const handleSaveSecurity = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const updates: Record<string, string> = {}
      if (newEmail.trim()) updates.email = newEmail.trim()
      if (newPassword.trim()) updates.password = newPassword.trim()
      if (Object.keys(updates).length === 0) { setSaving(false); return }

      const { error } = await supabase.auth.updateUser(updates)
      if (error) throw error

      if (newEmail) {
        await supabase.from('galliens').update({ email: newEmail }).eq('id', gallien.id)
        refreshGallien()
      }
      setSaveMsg('Modifications enregistrees.')
      setNewEmail('')
      setNewPassword('')
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  // --- Export RGPD ---
  const handleExportRGPD = async () => {
    const { data } = await supabase
      .from('galliens')
      .select('prenom, nom, email, pays, cecg_statut, rang, created_at, serment_date, rgpd_date')
      .eq('id', gallien.id)
      .single()

    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gallia-export-rgpd-${gallien.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // --- Supprimer compte ---
  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    await supabase.functions.invoke('supprimer-compte', { body: { gallienId: gallien.id } })
    await signOut()
    navigate('/')
  }

  return (
    <PageLayout withSidebar>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-noir mb-1">Mon Profil</h1>
        <p className="font-body text-sm text-gris-texte">Gestion de ton compte Gallien</p>
      </div>

      {/* Identite */}
      <div className="bg-blanc border border-gris rounded-sm p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-or-clair border-2 border-or flex items-center justify-center shrink-0">
            <span className="font-display text-2xl font-bold text-or-fonce">{initial}</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-noir">
              {gallien.prenom} {gallien.nom}
            </h2>
            <p className="font-body text-sm text-gris-texte tracking-wider mt-0.5">
              {gallien.numero_cecg ?? 'Numero en cours'}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge type="rang-merite">{gallien.rang}</Badge>
              <Badge type="statut-cecg">{gallien.cecg_statut}</Badge>
            </div>
          </div>
        </div>

        <GoldRule className="mb-5" />

        <div className="grid grid-cols-2 gap-4 text-sm font-body">
          <div>
            <p className="text-xs text-gris-texte mb-0.5">Email</p>
            <p className="text-noir font-medium">{gallien.email}</p>
          </div>
          <div>
            <p className="text-xs text-gris-texte mb-0.5">Merite total</p>
            <p className="font-display text-lg font-bold text-or">
              {(merite?.points_total ?? 0).toLocaleString('fr-FR')} pts
            </p>
          </div>
          <div>
            <p className="text-xs text-gris-texte mb-0.5">Membre depuis</p>
            <p className="text-noir">
              {new Date(gallien.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {gallien.pays && (
            <div>
              <p className="text-xs text-gris-texte mb-0.5">Pays</p>
              <p className="text-noir">{gallien.pays}</p>
            </div>
          )}
        </div>
      </div>

      {/* Telecharger CECG */}
      {gallien.numero_cecg && (
        <div className="bg-blanc border border-gris rounded-sm p-6 mb-5">
          <h3 className="font-display text-base font-semibold text-noir mb-4 flex items-center gap-2">
            <Download size={16} className="text-or" />
            Carte Civile Gallienne
          </h3>
          <p className="font-body text-sm text-gris-texte mb-4">
            Telecharge ta CECG en PDF. Elle contient un QR code de verification.
            Aucune donnee sensible n'y figure.
          </p>
          <Button
            variant="primary"
            size="md"
            loading={generatingPdf}
            onClick={handleDownloadCECG}
          >
            <Download size={15} className="mr-2" />
            Telecharger ma CECG PDF
          </Button>
        </div>
      )}

      {/* Lien de parrainage */}
      {lien && (
        <div className="bg-blanc border border-gris rounded-sm p-6 mb-5">
          <h3 className="font-display text-base font-semibold text-noir mb-4 flex items-center gap-2">
            <ChevronRight size={16} className="text-or" />
            Mon lien de parrainage
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 px-3 py-2.5 bg-gris-clair rounded-sm font-body text-xs text-gris-texte truncate border border-gris">
              {lien}
            </div>
            <button
              onClick={handleCopyLien}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-or rounded-sm font-body text-sm font-medium text-noir hover:bg-or-clair transition-colors shrink-0"
            >
              {copied ? <Check size={14} className="text-or" /> : <Copy size={14} />}
              {copied ? 'Copie' : 'Copier'}
            </button>
          </div>
        </div>
      )}

      {/* Securite */}
      <div className="bg-blanc border border-gris rounded-sm p-6 mb-5">
        <h3 className="font-display text-base font-semibold text-noir mb-4 flex items-center gap-2">
          <Shield size={16} className="text-or" />
          Securite
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block font-body text-xs text-gris-texte mb-1.5">
              Nouvel email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={gallien.email}
              className="w-full px-4 py-2.5 font-body text-sm text-noir border border-gris rounded-sm focus:outline-none focus:border-noir"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-gris-texte mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8 caracteres minimum"
              className="w-full px-4 py-2.5 font-body text-sm text-noir border border-gris rounded-sm focus:outline-none focus:border-noir"
            />
          </div>
          {saveMsg && (
            <p className="font-body text-sm text-or-fonce">{saveMsg}</p>
          )}
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            disabled={!newEmail && !newPassword}
            onClick={handleSaveSecurity}
          >
            Enregistrer les modifications
          </Button>
        </div>
      </div>

      {/* RGPD */}
      <div className="bg-blanc border border-gris rounded-sm p-6 mb-5">
        <h3 className="font-display text-base font-semibold text-noir mb-4">
          Mes donnees — RGPD
        </h3>
        <p className="font-body text-sm text-gris-texte mb-5 leading-relaxed">
          Conformement au RGPD, tu peux exporter ou supprimer toutes tes donnees a tout moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" size="sm" onClick={handleExportRGPD}>
            <Download size={14} className="mr-2" />
            Exporter mes donnees (JSON)
          </Button>
          <button
            onClick={handleDeleteAccount}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm font-body text-sm font-medium border transition-colors ${
              confirmDelete
                ? 'bg-red-600 text-blanc border-red-600 hover:bg-red-700'
                : 'bg-blanc text-red-600 border-red-200 hover:bg-red-50'
            }`}
          >
            <Trash2 size={14} />
            {confirmDelete ? 'Confirmer la suppression' : 'Supprimer mon compte'}
          </button>
        </div>
        {confirmDelete && (
          <p className="mt-3 font-body text-xs text-red-600">
            Cette action est irreversible. Toutes tes donnees seront supprimees.
          </p>
        )}
      </div>

      {/* Deconnexion */}
      <div className="flex justify-end">
        <button
          onClick={async () => { await signOut(); navigate('/') }}
          className="flex items-center gap-2 font-body text-sm text-gris-texte hover:text-noir transition-colors"
        >
          <LogOut size={15} />
          Se deconnecter
        </button>
      </div>
    </PageLayout>
  )
}
