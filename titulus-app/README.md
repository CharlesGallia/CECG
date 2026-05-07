# Titulus Civilis · Funnel d'adhésion

Funnel de souscription au **Titulus Civilis** — titre civil souverain de Gallia, délivré par le Consulat de Gallia sous l'autorité de l'**Imperio Gallorum Sociatis** (IGS).

- Maître d'ouvrage : Charles POURLIER, Premier Consul
- Maître d'œuvre : Association **GIFTER** — SIREN 533 624 649
- Domaine cible : `titulus.gallia.space`
- Référence cahier des charges : `IGS-CDC-TITULUS-001`

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (charte impériale noir / or / parchemin)
- React Router v7
- `@react-pdf/renderer` (PDF Declaratio Galliæ)
- `signature_pad` (canvas signature manuscrite)
- Supabase (sessions déclarants — V2)
- Stripe Checkout (one-shot 77 € — V2)
- hCaptcha (V2)
- Resend (e-mails transactionnels — V2)

## Démarrer en local

```bash
cd titulus-app
npm install
cp .env.example .env   # remplir les clés
npm run dev            # http://localhost:5174
```

## Les 6 étapes du funnel

| # | Route | Étape |
|---|---|---|
| I | `/` | Identité de base (formulaire + 3 consentements + hCaptcha) |
| II | `/adhesion` | Manifeste *Bâtir Gallia* + Stripe Checkout 77 € |
| III | `/declaratio` | État civil étendu + aperçu LIVE Declaratio |
| IV | `/signature` | Canvas signature + génération PDF Declaratio |
| V | `/kyc` | Upload pièce d'identité + selfie + preuve de vie |
| VI | `/confirmation` | Récapitulatif + e-mail final |

## Charte graphique

| Rôle | Hex |
|---|---|
| Noir impérial | `#0A0A0A` |
| Or principal | `#C9A84C` |
| Or pâle | `#E8D9A8` |
| Rouge cardinal | `#8C1E1E` |
| Parchemin | `#F4ECD8` |
| Charcoal | `#1E2A3B` |

Polices : **Cinzel** (titres trackés) · **Cormorant Garamond** (corps + italiques nobles).

## Assets

Les visuels héraldiques sont en `public/assets/`. Pour remplacer un placeholder SVG par la vraie image PNG :
- `sceau-igs.png` — sceau rond doré (header + filigrane PDF)
- `titulus-recto.png` / `titulus-verso.png` — carte Titulus Civilis
- `gallibra.png` — pièce *Libra Gallica* (étape II)
- `blason-couronne.png` — blason couronné (héro étape I)

Si l'un de ces fichiers est présent, il sera utilisé en priorité ; sinon, le composant SVG inline prend le relais.

## Production

Le funnel se déploie sur `titulus.gallia.space` (Hostinger Horizons ou Vercel — au choix).
