/**
 * Generateur CECG PDF — cote client avec pdf-lib
 * JAMAIS de donnees sensibles sur la carte :
 * pas de date de naissance, pas de numero de piece.
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

const OR  = rgb(0.722, 0.588, 0.047)  // #B8960C
const NOIR = rgb(0.067, 0.067, 0.067) // #111111

export interface CECGData {
  prenom: string
  nom: string
  numeroCecg: string
  rang: string
  statut: 'Definitive' | 'Provisoire'
  dateEmission: string        // JJ/MM/AAAA
  dateExpiration?: string     // si provisoire
  qrDataUrl?: string          // PNG base64
}

export async function generateCECGPdf(data: CECGData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()

  // Format carte : 85.6 x 54 mm -> 242 x 153 pt
  const W = 242
  const H = 153
  const page = doc.addPage([W, H])

  const helveticaBold   = await doc.embedFont(StandardFonts.HelveticaBold)
  const helvetica       = await doc.embedFont(StandardFonts.Helvetica)
  const helveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique)

  const { drawText, drawRectangle, drawLine } = page

  // --- Fond blanc ---
  drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) })

  // --- Bordure or ---
  drawRectangle({ x: 1.5, y: 1.5, width: W - 3, height: H - 3,
    borderColor: OR, borderWidth: 1.5, color: rgb(1,1,1) })

  // --- En-tete : IGS ---
  drawText('IGS', {
    x: W / 2 - helveticaBold.widthOfTextAtSize('IGS', 9) / 2,
    y: H - 18,
    size: 9, font: helveticaBold, color: NOIR,
  })
  drawText('Imperio Gallorum Sociatis', {
    x: W / 2 - helvetica.widthOfTextAtSize('Imperio Gallorum Sociatis', 6) / 2,
    y: H - 26,
    size: 6, font: helveticaOblique, color: OR,
  })

  // --- Ligne or decorative ---
  drawLine({ start: { x: 20, y: H - 32 }, end: { x: W - 20, y: H - 32 },
    thickness: 0.75, color: OR })

  // --- Titre carte ---
  const titre = 'CARTE CIVILE GALLIENNE'
  drawText(titre, {
    x: W / 2 - helveticaBold.widthOfTextAtSize(titre, 7.5) / 2,
    y: H - 43,
    size: 7.5, font: helveticaBold, color: NOIR,
  })

  // --- Nom ---
  const nomComplet = `${data.prenom.toUpperCase()} ${data.nom.toUpperCase()}`
  const nomSize = nomComplet.length > 22 ? 11 : 14
  drawText(nomComplet, {
    x: W / 2 - helveticaBold.widthOfTextAtSize(nomComplet, nomSize) / 2,
    y: H - 62,
    size: nomSize, font: helveticaBold, color: NOIR,
  })

  // --- Numero CECG ---
  drawText(data.numeroCecg, {
    x: W / 2 - helvetica.widthOfTextAtSize(data.numeroCecg, 8) / 2,
    y: H - 74,
    size: 8, font: helvetica, color: OR,
  })

  // --- Rang ---
  drawText(data.rang.toUpperCase(), {
    x: W / 2 - helveticaBold.widthOfTextAtSize(data.rang.toUpperCase(), 7) / 2,
    y: H - 85,
    size: 7, font: helveticaBold, color: NOIR,
  })

  // --- Ligne or ---
  drawLine({ start: { x: 20, y: H - 92 }, end: { x: W - 20, y: H - 92 },
    thickness: 0.5, color: OR })

  // --- Statut + date ---
  const statutLabel = data.statut === 'Definitive' ? 'Carte Definitive' : 'Carte Provisoire'
  drawText(statutLabel, {
    x: 20, y: H - 103,
    size: 7, font: helveticaBold, color: data.statut === 'Definitive' ? OR : NOIR,
  })

  drawText(`Emise le ${data.dateEmission}`, {
    x: 20, y: H - 113,
    size: 6.5, font: helvetica, color: NOIR,
  })

  if (data.statut === 'Provisoire' && data.dateExpiration) {
    drawText(`Valable jusqu'au ${data.dateExpiration}`, {
      x: 20, y: H - 122,
      size: 6, font: helveticaOblique, color: rgb(0.6, 0.4, 0),
    })
  }

  // --- QR Code ---
  if (data.qrDataUrl) {
    try {
      const base64 = data.qrDataUrl.replace(/^data:image\/png;base64,/, '')
      const pngBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const qrImage = await doc.embedPng(pngBytes)
      page.drawImage(qrImage, { x: W - 60, y: 16, width: 44, height: 44 })
    } catch { /* QR optionnel */ }
  }

  // --- Devise bas de page ---
  const devise = 'SOVEREGNITAS NON NEGOTIATUR. EXERCETUR.'
  drawText(devise, {
    x: W / 2 - helveticaOblique.widthOfTextAtSize(devise, 4.5) / 2,
    y: 8,
    size: 4.5, font: helveticaOblique, color: rgb(0.5, 0.5, 0.5),
  })

  return doc.save()
}

/**
 * Telecharge le PDF dans le navigateur.
 */
export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
