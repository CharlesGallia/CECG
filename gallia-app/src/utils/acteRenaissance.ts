/**
 * Générateur PDF — Acte de Renaissance Gallienne
 * Format A4 (595 x 842 pt) — 2 pages
 *
 * RÈGLE ABSOLUE : Prénom, Nom, Date de naissance, Lieu de naissance UNIQUEMENT.
 * Jamais d'adresse, d'email, de téléphone ni de numéro de pièce d'identité.
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { downloadPdf } from './cecg'

export interface ActeData {
  prenom: string
  nom: string
  dateNaissance: string    // JJ/MM/AAAA
  lieuNaissance: string
  numeroCecg?: string      // N° d'inscription au Registre Civil
}

// Palette
const OR      = rgb(0.722, 0.588, 0.047)   // #B8960C
const OR_FOND = rgb(0.847, 0.800, 0.620)   // clair pour bordures tableau
const NOIR    = rgb(0.067, 0.067, 0.067)   // #111111
const CREME   = rgb(0.98,  0.972, 0.941)   // fond parchemin
const CREME2  = rgb(0.951, 0.941, 0.910)   // lignes tableau alternées
const GRIS    = rgb(0.45,  0.45,  0.45)

// Chargement image depuis /assets/ avec fallback silencieux
async function embedImage(
  doc: PDFDocument,
  path: string
): Promise<import('pdf-lib').PDFImage | null> {
  try {
    const resp = await fetch(path)
    if (!resp.ok) return null
    const bytes = await resp.arrayBuffer()
    if (path.endsWith('.png')) return await doc.embedPng(bytes)
    return await doc.embedJpg(bytes)
  } catch {
    return null
  }
}

// Texte centré horizontalement
function drawCentered(
  page: import('pdf-lib').PDFPage,
  text: string,
  y: number,
  font: import('pdf-lib').PDFFont,
  size: number,
  color: import('pdf-lib').Color,
  pageWidth = 595
) {
  const w = font.widthOfTextAtSize(text, size)
  page.drawText(text, { x: (pageWidth - w) / 2, y, font, size, color })
}

export async function generateActeRenaissance(data: ActeData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()

  // Polices
  const bold        = await doc.embedFont(StandardFonts.HelveticaBold)
  const regular     = await doc.embedFont(StandardFonts.Helvetica)
  const italic      = await doc.embedFont(StandardFonts.HelveticaOblique)
  const timesBold   = await doc.embedFont(StandardFonts.TimesRomanBold)
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic)

  // Assets — fond clair → sceau noir/or
  const sceauImg      = await embedImage(doc, '/assets/sceau-igs.png')
  const signaturesImg = await embedImage(doc, '/assets/signatures-consuls.png')

  const W = 595
  const H = 842
  const MARGIN = 45

  // Date du jour
  const today = new Date()
  const dateActe = today.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  const numeroInscription = data.numeroCecg
    ?? `IGS/RC/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(Math.floor(Math.random() * 9000 + 1000))}`

  // ═══════════════════════════════════════════
  //  PAGE 1 — Section Déclarant
  // ═══════════════════════════════════════════
  const p1 = doc.addPage([W, H])

  // Fond crème
  p1.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREME })

  // Cadre or extérieur
  p1.drawRectangle({
    x: 18, y: 18, width: W - 36, height: H - 36,
    borderColor: OR, borderWidth: 1.5, color: undefined,
  })

  // ── En-tête ──────────────────────────────
  let y = H - 55

  // Sceau IGS haut gauche
  if (sceauImg) {
    p1.drawImage(sceauImg, { x: MARGIN, y: H - 105, width: 68, height: 68 })
  }

  // Titre principal (centré sur espace après sceau)
  p1.drawText('ACTE DE RENAISSANCE', {
    x: 128, y: H - 58,
    font: timesBold, size: 24, color: NOIR,
  })
  p1.drawText('GALLIENNE', {
    x: 128, y: H - 84,
    font: timesBold, size: 24, color: NOIR,
  })

  // Ligne or principale
  y = H - 116
  p1.drawLine({ start: { x: MARGIN, y }, end: { x: W - MARGIN, y }, thickness: 1.2, color: OR })

  // Sous-titre latin italique
  y -= 16
  drawCentered(p1,
    'Declaratio Renovationis Civilis in Imperio Galliae',
    y, timesItalic, 10, OR
  )

  // Ligne fine
  y -= 12
  p1.drawLine({ start: { x: MARGIN + 30, y }, end: { x: W - MARGIN - 30, y }, thickness: 0.4, color: OR })

  // ── Paragraphe introductif ────────────────
  y -= 20
  const introLines = [
    'Le présent Acte de Renaissance est le document fondateur par lequel le signataire déclare, en',
    'conscience et en pleine connaissance des faits historiques établis, recouvrer ou acquérir son état',
    "civil en tant que citoyen(ne) de l'Empire de Gallia, et s'engager au service de la renaissance",
    'souveraine de la Nation gallienne.',
  ]
  for (const line of introLines) {
    p1.drawText(line, { x: MARGIN, y, font: bold, size: 8.5, color: NOIR })
    y -= 13
  }

  // ── Je soussigné(e) ───────────────────────
  y -= 14
  p1.drawText('Je soussigné(e),', { x: MARGIN, y, font: regular, size: 10, color: NOIR })
  y -= 18

  // ── Tableau identité civile ───────────────
  // RÈGLE : Nom, Prénoms, Date naissance, Lieu naissance UNIQUEMENT
  const champsCivils = [
    { label: 'Nom de naissance', value: data.nom.toUpperCase() },
    { label: 'Prénoms',          value: data.prenom },
    { label: 'Date de naissance', value: data.dateNaissance },
    { label: 'Lieu de naissance', value: data.lieuNaissance },
  ]

  for (let i = 0; i < champsCivils.length; i++) {
    const bgColor = i % 2 === 0 ? CREME2 : CREME
    p1.drawRectangle({
      x: MARGIN, y: y - 20, width: W - MARGIN * 2, height: 26,
      color: bgColor, borderColor: OR_FOND, borderWidth: 0.5,
    })
    p1.drawText(champsCivils[i].label, {
      x: MARGIN + 8, y: y - 13,
      font: bold, size: 9, color: NOIR,
    })
    p1.drawText(champsCivils[i].value, {
      x: MARGIN + 185, y: y - 13,
      font: regular, size: 9, color: NOIR,
    })
    y -= 30
  }

  // ── DÉCLARE SOLENNELLEMENT ────────────────
  y -= 16
  p1.drawText('DÉCLARE SOLENNELLEMENT :', { x: MARGIN, y, font: timesBold, size: 12, color: OR })
  y -= 18

  const clauses = [
    [
      "Avoir pris pleine connaissance des faits historiques établis quant à la continuité de l'IMPERIUM",
      "GALLICUM, à la vacance du trône depuis 1920, et au dol constitutionnel perpétré depuis 1870 ;",
    ],
    [
      "Recouvrer / acquérir ma qualité de citoyen(ne) de l'Empire de Gallia, en vertu de ma souveraineté",
      "naturelle et inaliénable et en application de la Loi du 6 Fructidor An II, Article IV, toujours en vigueur ;",
    ],
    [
      "Adhérer aux valeurs fondamentales de la souveraineté populaire, de la liberté de conscience, et de",
      "la justice pour tous les Peuples, telles que portées par la renaissance gallienne ;",
    ],
    [
      "M'engager à contribuer, selon mes moyens et compétences, à l'effort de renaissance de la Nation",
      "gallienne, en temps et travail, et en loyauté envers le Peuple souverain de Gallia ;",
    ],
    [
      "Accepter de me soumettre à l'entretien consulaire et de respecter la décision souveraine des",
      "Trois Consuls provisoires ou de leurs substituts habilités.",
    ],
  ]

  for (let i = 0; i < clauses.length; i++) {
    p1.drawText(`${i + 1}.`, { x: MARGIN, y, font: bold, size: 8.5, color: OR })
    p1.drawText(clauses[i][0], { x: MARGIN + 14, y, font: bold, size: 8.5, color: NOIR })
    y -= 13
    p1.drawText(clauses[i][1], { x: MARGIN + 14, y, font: bold, size: 8.5, color: NOIR })
    y -= 18
  }

  // ── Fait à / Visa Consul ──────────────────
  y -= 8
  p1.drawLine({ start: { x: MARGIN, y }, end: { x: W - MARGIN, y }, thickness: 0.4, color: OR_FOND })
  y -= 18
  p1.drawText(`Fait à Menestreau, le ${dateActe}`, {
    x: MARGIN, y, font: regular, size: 9, color: NOIR,
  })
  p1.drawText('Visa du Consul admettant :', {
    x: 320, y, font: bold, size: 9, color: NOIR,
  })
  y -= 35
  p1.drawLine({ start: { x: MARGIN, y }, end: { x: 280, y }, thickness: 0.4, color: GRIS })
  p1.drawText('Signature du déclarant', { x: MARGIN, y: y + 4, font: italic, size: 7, color: GRIS })

  // ═══════════════════════════════════════════
  //  PAGE 2 — Réservé au Consulat
  // ═══════════════════════════════════════════
  const p2 = doc.addPage([W, H])
  p2.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREME })
  p2.drawRectangle({
    x: 18, y: 18, width: W - 36, height: H - 36,
    borderColor: OR, borderWidth: 1.5, color: undefined,
  })

  let y2 = H - 60

  // Titre section consulaire
  p2.drawText('RÉSERVÉ AU CONSULAT', { x: MARGIN, y: y2, font: timesBold, size: 18, color: NOIR })
  y2 -= 22
  p2.drawText("VISA D'INSCRIPTION AU REGISTRE CIVIL DE GALLIA", {
    x: MARGIN, y: y2, font: timesBold, size: 12, color: NOIR,
  })
  y2 -= 18
  p2.drawLine({ start: { x: MARGIN, y: y2 }, end: { x: W - MARGIN, y: y2 }, thickness: 1.2, color: OR })
  y2 -= 24

  // Tableau consulaire
  const consulatFields = [
    { label: "N° d'inscription au Registre Civil de Gallia", value: numeroInscription },
    { label: "Date d'inscription",                            value: dateActe },
    { label: 'Consul signataire',                             value: 'Glwadys COSTERISANT' },
    { label: 'Décision',                                      value: 'ADMIS(E)' },
    { label: 'Motif (si ajourné ou refusé)',                  value: '—' },
  ]

  for (let i = 0; i < consulatFields.length; i++) {
    const bg = i % 2 === 0 ? CREME2 : CREME
    const rowH = 28
    p2.drawRectangle({
      x: MARGIN, y: y2 - rowH + 6, width: W - MARGIN * 2, height: rowH + 2,
      color: bg, borderColor: OR_FOND, borderWidth: 0.5,
    })
    p2.drawText(consulatFields[i].label, {
      x: MARGIN + 8, y: y2 - 14,
      font: bold, size: 8.5, color: NOIR,
    })
    const isDecision = consulatFields[i].label === 'Décision'
    p2.drawText(consulatFields[i].value, {
      x: MARGIN + 240, y: y2 - 14,
      font: isDecision ? bold : regular,
      size: 9,
      color: isDecision ? OR : NOIR,
    })
    y2 -= 33
  }

  // Séparateur or
  y2 -= 16
  p2.drawLine({ start: { x: MARGIN, y: y2 }, end: { x: W - MARGIN, y: y2 }, thickness: 1, color: OR })
  y2 -= 20

  // Mottos
  drawCentered(p2, 'GALLIA GRATA DICAVIT — IMPERIO GALLORUM SOCIATIS', y2, italic, 9, OR)
  y2 -= 16
  drawCentered(p2, 'La souveraineté ne se négocie pas. Elle s\'exerce.', y2, bold, 9, NOIR)
  y2 -= 14
  drawCentered(p2, '8 Route du Minerai — Menestreau — Gallia Belgica — GALLIAE', y2, italic, 8, GRIS)
  y2 -= 40

  // ── Signatures des 3 Consuls ──────────────
  if (signaturesImg) {
    // Image de la table des signatures (complète)
    const imgH = 95
    p2.drawImage(signaturesImg, {
      x: MARGIN, y: y2 - imgH,
      width: W - MARGIN * 2, height: imgH,
    })
    y2 -= imgH + 16
  } else {
    // Fallback : 3 colonnes textuelles
    const consuls = [
      { titre: 'Premier Consul',    nom: 'Charles POURLIER',    role: 'Garant de la continuité institutionnelle' },
      { titre: 'Second Consul',     nom: 'Glwadys COSTERISANT', role: 'Relations civiques et accueil des Galliens' },
      { titre: 'Troisième Consul',  nom: 'Narek ARSHAKYAN',     role: 'Affaires extérieures et documentation' },
    ]
    const colW = (W - MARGIN * 2) / 3
    for (let i = 0; i < consuls.length; i++) {
      const cx = MARGIN + i * colW
      p2.drawRectangle({
        x: cx + 2, y: y2 - 82, width: colW - 4, height: 84,
        borderColor: OR_FOND, borderWidth: 0.5, color: CREME2,
      })
      p2.drawText(consuls[i].titre, { x: cx + 8, y: y2 - 14, font: italic, size: 8, color: GRIS })
      p2.drawText(consuls[i].nom,   { x: cx + 8, y: y2 - 28, font: bold,   size: 8.5, color: NOIR })
      p2.drawText(consuls[i].role,  { x: cx + 8, y: y2 - 42, font: italic, size: 7.5, color: GRIS })
      p2.drawText('Signature :',    { x: cx + 8, y: y2 - 62, font: regular, size: 8, color: GRIS })
      // Ligne de signature
      p2.drawLine({ start: { x: cx + 8, y: y2 - 76 }, end: { x: cx + colW - 10, y: y2 - 76 }, thickness: 0.4, color: GRIS })
    }
    y2 -= 96
  }

  // Millésime gallien
  y2 -= 8
  drawCentered(p2, "Galli'An I — An de grâce MMXXVI", y2, timesItalic, 9, OR)

  // Sceau IGS bas droite
  if (sceauImg) {
    p2.drawImage(sceauImg, {
      x: W - MARGIN - 65, y: y2 - 65,
      width: 60, height: 60,
    })
  }

  return doc.save()
}

export function downloadActe(bytes: Uint8Array, nom: string) {
  downloadPdf(bytes, `Acte-Renaissance-${nom.toUpperCase()}.pdf`)
}
