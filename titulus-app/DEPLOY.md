# Guide de déploiement — Titulus Civilis sur Vercel

Ce guide est pensé pour quelqu'un **qui débute** : tu n'as **rien à installer sur ton ordinateur**, tout se fait dans le navigateur.

---

## 0. Préalable — Régénérer tes clés

⚠️ Tes clés Stripe / Supabase / Resend / Hostinger ont été partagées dans un chat. Avant tout, **régénère-les** :

| Service | Lien |
|---|---|
| Stripe | https://dashboard.stripe.com/apikeys → bouton **Roll** sur la clé secrète |
| Supabase | https://supabase.com/dashboard → ton projet → Settings → API → **Reset service_role key** |
| Resend | https://resend.com/api-keys → supprimer + créer une nouvelle clé |
| Hostinger | hPanel → Espace API → révoquer + créer un nouveau jeton |

---

## 1. Créer le compte Vercel (gratuit)

1. Va sur https://vercel.com/signup
2. Choisis **« Continue with GitHub »** et autorise Vercel à voir tes dépôts
3. Tu arrives sur ton dashboard Vercel — c'est tout pour cette étape

---

## 2. Importer le projet

1. Sur ton dashboard Vercel, clique **« Add New… »** → **« Project »**
2. Trouve le dépôt **`CharlesGallia/CECG`** dans la liste et clique **Import**
3. Sur l'écran de configuration :
   - **Project Name** : `titulus-civilis` (ou ce que tu veux)
   - **Framework Preset** : Vite (détecté automatiquement)
   - **Root Directory** : ⚠️ **clique « Edit » et sélectionne `titulus-app`** (très important — c'est ce qui dit à Vercel d'aller chercher dans le sous-dossier)
   - **Build Command** : laisse `npm run build`
   - **Output Directory** : laisse `dist`
4. **Ne clique pas encore Deploy** — on va d'abord remplir les variables d'environnement (étape 3).

---

## 3. Variables d'environnement (Stripe TEST + Supabase + hCaptcha + Resend)

Sur la même page d'import, déplie la section **« Environment Variables »** et ajoute une à une les clés suivantes :

| Nom de la variable | Où trouver la valeur |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → **Project URL** (ex. `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → **anon public key** (la clé `sb_publishable_*`, c'est OK qu'elle soit publique) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → **service_role** (la nouvelle, jamais affichée côté navigateur) |
| `VITE_HCAPTCHA_SITEKEY` | https://dashboard.hcaptcha.com → ta clé publique du site |
| `HCAPTCHA_SECRET` | hCaptcha dashboard → secret key (côté serveur uniquement) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys → **Publishable key (mode TEST)** — commence par `pk_test_…` |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → **Secret key (mode TEST)** — commence par `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | (à remplir plus tard, étape 6) |
| `RESEND_API_KEY` | Resend dashboard → API Keys → la nouvelle clé |
| `VITE_PUBLIC_BASE_URL` | `https://adherer.gallia.space` (ou pour le moment l'URL Vercel temporaire) |

**Pour chaque variable** : indique-la sur les 3 environnements (Production / Preview / Development). C'est l'option par défaut.

---

## 4. Déployer

1. Une fois toutes les variables saisies, clique **« Deploy »**
2. Vercel build le projet (1 à 2 minutes). Tu verras les logs en direct.
3. Quand c'est fini, tu obtiens une URL temporaire genre `titulus-civilis-xxxx.vercel.app`. **Clique-la** : ton funnel est en ligne 🎉

---

## 5. Connecter le domaine `adherer.gallia.space`

### 5.a. Côté Vercel
1. Sur ton projet Vercel → **Settings** → **Domains**
2. Tape `adherer.gallia.space` et clique **Add**
3. Vercel te donne un enregistrement **CNAME** à créer (généralement `cname.vercel-dns.com`)

### 5.b. Côté Hostinger DNS
1. Connecte-toi à hPanel Hostinger
2. Va dans **Domaines** → `gallia.space` → **DNS / Nameservers**
3. Ajoute un enregistrement :
   - Type : **CNAME**
   - Nom : `adherer`
   - Pointe vers : (ce que Vercel t'a donné, ex. `cname.vercel-dns.com`)
   - TTL : `3600`
4. Sauvegarde
5. Retour sur Vercel → la configuration passe de « Invalid » à « Valid » au bout de quelques minutes (parfois jusqu'à 1 h)

À partir de là, **https://adherer.gallia.space** affiche ton funnel.

---

## 6. Webhook Stripe (à faire après le premier déploiement)

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL : `https://adherer.gallia.space/api/stripe/webhook`
3. Sélectionner les événements :
   - `checkout.session.completed`
4. Une fois créé, Stripe te donne un **Signing secret** (commence par `whsec_…`)
5. Retourne dans Vercel → Settings → Environment Variables → mets cette valeur dans `STRIPE_WEBHOOK_SECRET`
6. Redéploie (Vercel le propose automatiquement)

---

## 7. Comment je te livre les nouveaux développements

À chaque fois que tu me demandes une modification, je fais `git push` sur la branche `claude/gallia-membership-funnel-3vf50`. Vercel détecte automatiquement le push et **redéploie en 1-2 minutes**. Tu vois la nouvelle version en ligne sans rien faire.

---

## 8. Bascule LIVE Stripe (quand tout est validé)

1. Stripe Dashboard → bascule en haut à droite **Test → Live**
2. Recopie tes clés `pk_live_*` et `sk_live_*` dans Vercel Environment Variables (Production uniquement)
3. Refais l'étape 6 webhook avec l'URL `https://adherer.gallia.space/api/stripe/webhook`
4. Redéploie

---

## En cas de problème

- Logs Vercel : Dashboard → ton projet → **Deployments** → clique le dernier → **Build Logs / Runtime Logs**
- Variable d'environnement manquante : Vercel affiche en rouge le nom dans les logs
- DNS qui tarde : utilise https://dnschecker.org/ pour vérifier la propagation

Tu peux toujours me solliciter pour debug — montre-moi le message d'erreur exact.
