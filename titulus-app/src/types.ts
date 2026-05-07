/**
 * Types du funnel Titulus Civilis.
 */

export type SessionStatus =
  | 'IDENTITE_OK'
  | 'PAIEMENT_OK'
  | 'DECLARATIO_OK'
  | 'DECLARATIO_SIGNEE'
  | 'KYC_TRANSMIS'
  | 'KYC_VALIDE'
  | 'KYC_REFUSE'

export type Identite = {
  prenom: string
  nom: string
  email: string
}

export type Declaratio = {
  prenom: string
  nom: string
  nomGallien?: string
  dateNaissance: string         // YYYY-MM-DD
  lieuNaissance: string
  paysNaissance: string
  nationalite: string
  numeroVoie: string
  complementAdresse?: string
  codePostal: string
  ville: string
  pays: string
  email: string
  telephone: string
}

export type KYCFiles = {
  recto: File | null
  selfie: File | null
  preuveVie: File | null
}

export type FunnelSession = {
  uuid: string
  status: SessionStatus
  numeroDeclaratio?: string     // IGS-DEC-AAAAMMJJ-HHMMSS-NNN
  identite?: Identite
  declaratio?: Declaratio
  signatureDataUrl?: string     // base64 PNG du canvas signature
  pdfDataUrl?: string           // dataURL du PDF généré
  paiementOk?: boolean
  kycTransmis?: boolean
  consents: {
    fondements: boolean
    rgpd: boolean
    libreVolonte: boolean
    primumNonNocere: boolean
    retractation: boolean
    pieceCertifiee: boolean
  }
  createdAt: string
}
