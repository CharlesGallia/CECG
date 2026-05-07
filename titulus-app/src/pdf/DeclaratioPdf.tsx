/**
 * PDF Declaratio Galliæ — généré côté client avec @react-pdf/renderer.
 * Reproduit le gabarit officiel décrit en Annexe A du Cahier des Charges.
 *
 * Format A4 portrait, fond parchemin, double cadre or, mise en page :
 *   En-tête tracké · Sceau · Titre DECLARATIO GALLIÆ · N° · Bloc déclaratif ·
 *   Liste fondements · DÉCLARE · REVENDIQUE · Encart Primum Non Nocere ·
 *   ATTESTE · Signature · Footer technique IP/UTC/hash.
 */
import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path, Circle, Rect } from '@react-pdf/renderer'
import type { Declaratio } from '../types'
import { formatDateFR } from '../utils/dates'

// ─── Polices Google Fonts (woff2) ──────────────────────────────────────────
Font.register({
  family: 'Cinzel',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cinzel/v24/8vIU7ww63mVu7gtR-kwKxNvkNOjw-tbnTYrvDE5ZdqU.ttf' },
    { src: 'https://fonts.gstatic.com/s/cinzel/v24/8vIK7ww63mVu7gtzTUHeFaWvNCXgowNKMLkw_b3JpYE.ttf', fontWeight: 700 },
  ],
})
Font.register({
  family: 'Cormorant',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3YmX5slCNuHLi8bLeY9MK7whWMhyjornFLsS6V7w.ttf' },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3WmX5slCNuHLi8bLeY9MK7whWMhyjQAllvuQWJ5hMzpg.ttf', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEPjuHfNvVBl1A.ttf', fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v16/co3XmX5slCNuHLi8bLeY9MK7whWMhyjYpEvjuHfPpVBl9MM.ttf', fontWeight: 700, fontStyle: 'italic' },
  ],
})

const COL = {
  parchemin: '#F4ECD8',
  parcheminWarm: '#F0E4C4',
  or: '#C9A84C',
  orFonce: '#8C7A2E',
  charcoal: '#1E2A3B',
  charcoalPale: '#5A4D2A',
  cardinal: '#8C1E1E',
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: COL.parchemin,
    paddingTop: 18 * 2.83,
    paddingBottom: 18 * 2.83,
    paddingHorizontal: 18 * 2.83,
    fontFamily: 'Cormorant',
    fontSize: 11,
    color: COL.charcoal,
    lineHeight: 1.55,
  },
  outerFrame: {
    flex: 1,
    borderWidth: 1.4,
    borderColor: COL.or,
    padding: 6 * 2.83,
  },
  innerFrame: {
    flex: 1,
    borderWidth: 0.6,
    borderColor: COL.or,
    padding: 14 * 2.83,
  },
  headerTracked: {
    fontFamily: 'Cinzel',
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 1.8,
    marginBottom: 14,
  },
  sealWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Cinzel',
    fontSize: 26,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
    fontWeight: 700,
    letterSpacing: 1.3,
  },
  subtitle: {
    fontFamily: 'Cormorant',
    fontStyle: 'italic',
    fontSize: 10,
    textAlign: 'center',
    color: COL.charcoalPale,
    marginBottom: 6,
  },
  shortRule: {
    alignSelf: 'center',
    width: 50,
    borderBottomWidth: 0.7,
    borderBottomColor: COL.or,
    marginVertical: 6,
  },
  refNumber: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    textAlign: 'center',
    letterSpacing: 1.2,
    color: COL.charcoalPale,
    marginBottom: 6,
  },
  longRule: {
    borderBottomWidth: 0.6,
    borderBottomColor: COL.or,
    marginVertical: 8,
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 8,
    textAlign: 'justify',
  },
  listLine: {
    fontSize: 10.5,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  listLineCardinal: {
    fontSize: 10.5,
    fontStyle: 'italic',
    color: COL.cardinal,
    fontWeight: 700,
    marginBottom: 2,
  },
  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
  cardinal: { color: COL.cardinal, fontWeight: 700 },
  encartPNN: {
    backgroundColor: COL.parcheminWarm,
    borderWidth: 0.5,
    borderColor: COL.or,
    padding: 8,
    marginVertical: 8,
  },
  encartPNNTitle: {
    fontFamily: 'Cinzel',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: 700,
    marginBottom: 4,
  },
  signatureRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  signatureLeft: { width: '40%', fontSize: 11 },
  signatureRight: { width: '60%', alignItems: 'flex-end' },
  signatureLabel: {
    fontFamily: 'Cinzel',
    fontSize: 8,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  signatureBox: {
    width: 200,
    height: 70,
    position: 'relative',
  },
  signatureUnderline: {
    width: 200,
    borderBottomWidth: 0.7,
    borderBottomColor: COL.charcoal,
    marginTop: 2,
  },
  gifterMention: {
    fontFamily: 'Cinzel',
    fontSize: 7,
    textAlign: 'center',
    letterSpacing: 1.2,
    color: COL.charcoalPale,
    marginTop: 14,
  },
  dottedRule: {
    borderTopWidth: 0.5,
    borderTopColor: COL.charcoalPale,
    borderStyle: 'dashed',
    marginVertical: 6,
  },
  techFooter: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    textAlign: 'center',
    color: COL.charcoalPale,
    letterSpacing: 0.4,
  },
})

function MiniSeal() {
  // Sceau IGS simplifié rendu en SVG natif PDF.
  return (
    <Svg width="60" height="60" viewBox="0 0 60 60">
      <Circle cx="30" cy="30" r="28" fill="#0A0A0A" stroke={COL.or} strokeWidth="1.2" />
      <Circle cx="30" cy="30" r="24" fill="none" stroke={COL.or} strokeWidth="0.4" />
      <Path
        d="M 30,12 C 26,18 24,24 27,29 C 23,26 19,28 19,33 C 19,38 24,40 28,38 L 28,42 C 24,42 22,44 22,46 L 38,46 C 38,44 36,42 32,42 L 32,38 C 36,40 41,38 41,33 C 41,28 37,26 33,29 C 36,24 34,18 30,12 Z"
        fill={COL.or}
      />
    </Svg>
  )
}

type Props = {
  data: Declaratio
  numero: string
  signatureDataUrl?: string
  ip?: string
  hashTronc?: string
  utcTimestamp?: string
}

export default function DeclaratioPdf({
  data,
  numero,
  signatureDataUrl,
  ip = 'À renseigner',
  hashTronc = 'À calculer',
  utcTimestamp,
}: Props) {
  const utc = utcTimestamp ?? new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC'
  const adresseComplete = [
    data.numeroVoie,
    data.complementAdresse,
    `${data.codePostal} ${data.ville}`.trim(),
    data.pays,
  ].filter((p) => p && p.trim()).join(', ')

  const dateNaiss = data.dateNaissance ? formatDateFR(data.dateNaissance) : '________'
  const dateAuj = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const heureAuj = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <Document
      title={`Declaratio Galliæ — ${numero}`}
      author="Imperio Gallorum Sociatis · Consulat de Gallia"
      subject="Déclaration d'appartenance au Peuple de Gallia"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.outerFrame}>
          <View style={styles.innerFrame}>
            <Text style={styles.headerTracked}>
              IMPERIO GALLORUM SOCIATIS  ·  CONSULAT DE GALLIA
            </Text>

            <View style={styles.sealWrap}>
              <MiniSeal />
            </View>

            <Text style={styles.title}>DECLARATIO GALLIÆ</Text>
            <Text style={styles.subtitle}>Déclaration d'appartenance au Peuple de Gallia</Text>

            <View style={styles.shortRule} />
            <Text style={styles.refNumber}>N° {numero}</Text>
            <View style={styles.longRule} />

            {/* Bloc déclaratif */}
            <Text style={styles.paragraph}>
              Je soussigné(e), <Text style={styles.bold}>{data.prenom} {data.nom.toUpperCase()}</Text>
              {data.nomGallien && data.nomGallien.trim()
                ? <> (nom gallien choisi : <Text style={styles.italic}>{data.nomGallien}</Text>)</>
                : null}
              , né(e) le <Text style={styles.bold}>{dateNaiss}</Text> à <Text style={styles.bold}>{data.lieuNaissance}</Text>,
              de nationalité civile <Text style={styles.bold}>{data.nationalite}</Text>,
              domicilié(e) à <Text style={styles.bold}>{adresseComplete}</Text>,
              joignable à <Text style={styles.bold}>{data.email}</Text>,
            </Text>

            <Text style={styles.paragraph}>conformément aux fondements du droit international public :</Text>

            <View style={{ paddingLeft: 12, marginBottom: 8 }}>
              <Text style={styles.listLineCardinal}>— Art. 15 DUDH (ONU, 1948) ;</Text>
              <Text style={styles.listLine}>— Convention de Montevideo, Art. 1 (1933) ;</Text>
              <Text style={styles.listLine}>— Charte ONU, Art. 1§2 (1945) ;</Text>
              <Text style={styles.listLine}>— PIDCP, Art. 1 (1966) ;</Text>
            </View>

            <Text style={styles.paragraph}>
              <Text style={styles.bold}>DÉCLARE</Text> solennellement mon appartenance au peuple de Gallia,
              entité souveraine attestée sans discontinuité depuis plus de trois millénaires.
            </Text>

            <Text style={styles.paragraph}>
              <Text style={styles.bold}>REVENDIQUE</Text> le droit inaliénable à la nationalité gallienne au sein de
              l'<Text style={styles.italic}>Imperio Gallorum Sociatis</Text>.
            </Text>

            {/* Encart Primum Non Nocere */}
            <View style={styles.encartPNN}>
              <Text style={styles.encartPNNTitle}>⚜  GALLIA PRIMUM NON NOCERE</Text>
              <Text style={{ fontSize: 10.5 }}>
                Je déclare solennellement, <Text style={styles.bold}>sur mon honneur</Text>, adhérer au Principe Fondamental de Gallia :{' '}
                <Text style={styles.italic}>Primum Non Nocere</Text>. Je m'engage à <Text style={styles.bold}>préserver mon semblable comme moi-même</Text>{' '}
                et à ne porter atteinte à quiconque de quelque manière que ce soit.
              </Text>
            </View>

            <Text style={styles.paragraph}>
              <Text style={styles.bold}>ATTESTE</Text> n'avoir fait l'objet d'aucune contrainte.
            </Text>
            <Text style={[styles.paragraph, styles.italic, { fontSize: 10, color: COL.charcoalPale }]}>
              Déclaration établie en exemplaire numérique horodaté, conservé par le Consulat de Gallia.
            </Text>

            <View style={styles.longRule} />

            {/* Bloc signature */}
            <View style={styles.signatureRow}>
              <View style={styles.signatureLeft}>
                <Text>
                  Fait le <Text style={styles.bold}>{dateAuj}</Text> à <Text style={styles.bold}>{heureAuj}</Text>
                </Text>
                <Text>à <Text style={styles.bold}>{data.pays}</Text></Text>
              </View>
              <View style={styles.signatureRight}>
                <Text style={styles.signatureLabel}>SIGNATURE</Text>
                <View style={styles.signatureBox}>
                  {/* Sceau filigrane */}
                  <View style={{ position: 'absolute', right: 30, top: 0, opacity: 0.3 }}>
                    <Svg width="60" height="60" viewBox="0 0 60 60">
                      <Circle cx="30" cy="30" r="26" fill="none" stroke={COL.charcoal} strokeWidth="1" />
                      <Rect x="14" y="14" width="32" height="32" fill="none" stroke={COL.charcoal} strokeWidth="0.5" />
                    </Svg>
                  </View>
                  {/* Signature manuscrite */}
                  {signatureDataUrl ? (
                    <Image src={signatureDataUrl} style={{ width: 200, height: 60 }} />
                  ) : null}
                </View>
                <View style={styles.signatureUnderline} />
              </View>
            </View>

            <Text style={styles.gifterMention}>
              ASSOCIATION GIFTER  ·  SIREN 533 624 649  ·  SAINT-DENIS  ·  GALLIA AETERNA
            </Text>

            <View style={styles.dottedRule} />

            <Text style={styles.techFooter}>
              Signé électroniquement en ligne le {dateAuj} à {utc}  ·  IP : {ip}  ·  Hash : {hashTronc}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
