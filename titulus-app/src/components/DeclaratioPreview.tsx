/**
 * Aperçu LIVE de la Declaratio sur fond parchemin avec double bordure or.
 * Reproduit (en HTML) la mise en page du PDF officiel pour donner au déclarant
 * une vision en temps réel du document final.
 */
import type { Declaratio } from '../types'
import { formatDateFR } from '../utils/dates'
import SceauIGS from '../assets/SceauIGS'
import FleurDeLys from '../assets/FleurDeLys'

type Props = {
  data: Partial<Declaratio>
  numero?: string
  liveBadge?: boolean
}

export default function DeclaratioPreview({ data, numero, liveBadge = true }: Props) {
  const adresseComplete = [
    data.numeroVoie,
    data.complementAdresse,
    [data.codePostal, data.ville].filter(Boolean).join(' '),
    data.pays,
  ].filter(Boolean).join(', ')

  const fmt = (v?: string) => v && v.trim() ? v : '________'

  return (
    <div
      className="relative"
      style={{
        background: '#F4ECD8',
        padding: '6px',
        border: '1px solid #C9A84C',
        borderRadius: '4px',
        fontFamily: '"Cormorant Garamond", Georgia, serif',
        color: '#1E2A3B',
      }}
    >
      <div
        className="relative"
        style={{
          padding: '36px 32px',
          border: '1px solid #C9A84C',
          borderRadius: '2px',
          minHeight: '600px',
        }}
      >
        {liveBadge && (
          <div
            className="absolute top-3 right-3 flex items-center gap-2 bg-noir text-emerald-400 px-2 py-1 rounded-sm"
            aria-live="polite"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-blink" />
            <span className="text-[10px] font-cinzel tracking-imperial-tight uppercase">Live</span>
          </div>
        )}

        {/* En-tête */}
        <div className="text-center mb-4">
          <div
            className="font-cinzel text-[10px] uppercase font-semibold"
            style={{ letterSpacing: '0.18em', color: '#1E2A3B' }}
          >
            IMPERIO GALLORUM SOCIATIS · CONSULAT DE GALLIA
          </div>
        </div>

        {/* Sceau */}
        <div className="flex justify-center mb-4">
          <SceauIGS size={70} />
        </div>

        {/* Titre */}
        <h2
          className="font-cinzel text-center font-bold mb-1"
          style={{ fontSize: '26px', letterSpacing: '0.05em', color: '#1E2A3B' }}
        >
          DECLARATIO GALLIÆ
        </h2>
        <p className="text-center italic mb-3" style={{ fontSize: '12px', opacity: 0.8 }}>
          Déclaration d'appartenance au Peuple de Gallia
        </p>

        {/* Filet court */}
        <div className="flex justify-center mb-2">
          <div style={{ height: '1px', width: '60px', background: '#C9A84C' }} />
        </div>

        {/* N° de référence */}
        <div
          className="text-center mb-3 font-mono"
          style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#5A4D2A' }}
        >
          N° {numero ?? 'IGS-DEC-AAAAMMJJ-HHMMSS-NNN'}
        </div>

        {/* Filet large */}
        <div style={{ height: '1px', background: '#C9A84C', margin: '0 0 16px' }} />

        {/* Bloc déclaratif */}
        <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '12px' }}>
          Je soussigné(e), <strong>{fmt(data.prenom)} {fmt(data.nom).toUpperCase()}</strong>
          {data.nomGallien && data.nomGallien.trim() && (
            <> (nom gallien choisi : <em>{data.nomGallien}</em>)</>
          )}
          , né(e) le <strong>{data.dateNaissance ? formatDateFR(data.dateNaissance) : '________'}</strong> à <strong>{fmt(data.lieuNaissance)}</strong>,
          de nationalité civile <strong>{fmt(data.nationalite)}</strong>,
          domicilié(e) à <strong>{adresseComplete || '________'}</strong>,
          joignable à <strong>{fmt(data.email)}</strong>,
        </p>

        <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '8px' }}>
          conformément aux fondements du droit international public :
        </p>

        <ul style={{ fontSize: '13px', lineHeight: 1.7, marginBottom: '12px', paddingLeft: '16px' }}>
          <li className="italic">
            — <strong style={{ color: '#8C1E1E' }}>Art. 15 DUDH</strong> (ONU, 1948) ;
          </li>
          <li className="italic">— Convention de Montevideo, Art. 1 (1933) ;</li>
          <li className="italic">— Charte ONU, Art. 1§2 (1945) ;</li>
          <li className="italic">— PIDCP, Art. 1 (1966) ;</li>
        </ul>

        <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '10px' }}>
          <strong>DÉCLARE</strong> solennellement mon appartenance au peuple de Gallia,
          entité souveraine attestée sans discontinuité depuis plus de trois millénaires.
        </p>
        <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '14px' }}>
          <strong>REVENDIQUE</strong> le droit inaliénable à la nationalité gallienne au sein de l'<em>Imperio Gallorum Sociatis</em>.
        </p>

        {/* Encart Primum Non Nocere */}
        <div
          style={{
            background: '#F0E4C4',
            border: '1px solid #C9A84C',
            padding: '12px 14px',
            margin: '10px 0 14px',
            borderRadius: '2px',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FleurDeLys size={14} color="#C9A84C" />
            <span
              className="font-cinzel font-semibold"
              style={{ fontSize: '11px', letterSpacing: '0.15em', color: '#1E2A3B' }}
            >
              GALLIA PRIMUM NON NOCERE
            </span>
          </div>
          <p style={{ fontSize: '12px', lineHeight: 1.55, margin: 0 }}>
            Je déclare solennellement, <strong>sur mon honneur</strong>, adhérer au Principe Fondamental de Gallia :{' '}
            <em>Primum Non Nocere</em>. Je m'engage à <strong>préserver mon semblable comme moi-même</strong> et à ne porter atteinte à quiconque
            de quelque manière que ce soit.
          </p>
        </div>

        <p style={{ fontSize: '14px', lineHeight: 1.65, marginBottom: '8px' }}>
          <strong>ATTESTE</strong> n'avoir fait l'objet d'aucune contrainte.
        </p>
        <p className="italic" style={{ fontSize: '11px', opacity: 0.75, marginBottom: '14px' }}>
          Déclaration établie en exemplaire numérique horodaté, conservé par le Consulat de Gallia.
        </p>

        <div style={{ height: '1px', background: '#C9A84C', margin: '14px 0' }} />

        {/* Bloc signature */}
        <div className="grid grid-cols-[40%_60%] gap-4">
          <div style={{ fontSize: '11px', lineHeight: 1.6 }}>
            Fait le <strong>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            <br />
            à <strong>{fmt(data.pays)}</strong>
          </div>
          <div className="text-right">
            <div className="text-[9px] tracking-imperial uppercase font-cinzel mb-2" style={{ color: '#1E2A3B' }}>
              Signature
            </div>
            <div className="h-12 border-b" style={{ borderColor: '#1E2A3B', opacity: 0.4 }} />
          </div>
        </div>

        {/* Pied */}
        <div
          className="text-center mt-6 font-cinzel"
          style={{ fontSize: '8px', letterSpacing: '0.12em', color: '#5A4D2A' }}
        >
          ASSOCIATION GIFTER · SIREN 533 624 649 · SAINT-DENIS · GALLIA AETERNA
        </div>
      </div>
    </div>
  )
}
