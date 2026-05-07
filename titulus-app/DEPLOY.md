# Guide de déploiement — Titulus Civilis sur Vercel

Ce guide est pensé pour quelqu'un **qui débute**. Tu n'as **rien à installer sur ton ordinateur**, tout se fait dans le navigateur. Compte ~ 30 minutes la première fois.

> 💡 **Astuce langue** : si l'interface Vercel apparaît en anglais, fais un **clic droit → « Traduire en français »** sur Chrome / Edge / Safari. Toute la page se traduit instantanément.

---

## 0. Préalable — Régénérer tes clés sensibles

⚠️ **Avant tout**, régénère les clés que tu as partagées en chat (toutes sauf les Stripe TEST nouvelles) :

| Service | Lien direct | Ce que tu fais |
|---|---|---|
| Supabase service_role | `https://supabase.com/dashboard` → ton projet → Settings → API | Bouton **« Reset service_role key »** |
| Resend | `https://resend.com/api-keys` | Supprime l'ancienne, crée-en une nouvelle |
| Hostinger | hPanel → Espace API | Révoque l'ancien jeton, crée-en un nouveau |

Garde les nouvelles valeurs **en sécurité** (gestionnaire de mots de passe, pas dans un chat).

---

## 1. Configurer Supabase (5 min)

### 1.a. Créer la table et le bucket

1. Va sur https://supabase.com/dashboard → ton projet
2. Menu gauche → **SQL Editor** → bouton **« New query »**
3. Ouvre le fichier `titulus-app/supabase/migrations/0001_titulus_sessions.sql` dans ton dépôt GitHub
4. **Copie tout le contenu** et colle-le dans l'éditeur SQL Supabase
5. Clique **« Run »** (en bas à droite)
6. Tu dois voir « Success. No rows returned. »

### 1.b. Vérifier le bucket KYC

1. Menu gauche → **Storage**
2. Tu dois voir un bucket nommé `kyc-temp` avec un cadenas 🔒 (privé)
3. Si tu ne le vois pas : clique **« New bucket »**, nom = `kyc-temp`, **décoche** « Public bucket », valide

C'est tout pour Supabase.

---

## 2. Créer le compte Vercel et importer le projet (5 min)

1. Va sur https://vercel.com/signup
2. Choisis **« Continue with GitHub »** et autorise Vercel
3. **Une fois connecté**, ouvre ce lien : https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2FCharlesGallia%2FCECG
   - Si ça ne marche pas, va sur https://vercel.com/new et tape `CECG` dans la barre de recherche, puis clique **« Import »**
4. Sur l'écran de configuration :
   - **Project Name** : `titulus-civilis` (ou ce que tu veux)
   - **Framework Preset** : Vite (détecté automatiquement)
   - ⚠️ **Root Directory** : clique **« Edit »** et choisis **`titulus-app`** (très important — sinon Vercel ne trouvera pas le projet)
   - Branch : choisis `claude/gallia-membership-funnel-3vf50`
   - **Build Command** : laisse `npm run build`
   - **Output Directory** : laisse `dist`

**Ne clique PAS encore « Deploy »** — on remplit d'abord les variables (étape 3).

---

## 3. Variables d'environnement (10 min)

Sur la même page d'import, déplie la section **« Environment Variables »** et ajoute une à une **les 11 variables** ci-dessous :

| # | Nom (à copier exact) | Où trouver la valeur | Sensibilité |
|---|---|---|---|
| 1 | `VITE_SUPABASE_URL` | Supabase → Settings → API → **Project URL** (ex. `https://xxxxx.supabase.co`) | Publique |
| 2 | `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → clé **anon public** (préfixe `sb_publishable_…`) | Publique |
| 3 | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → clé **service_role** (préfixe `sb_secret_…`) | 🔒 **Très sensible** |
| 4 | `VITE_HCAPTCHA_SITEKEY` | https://dashboard.hcaptcha.com → Site key | Publique |
| 5 | `HCAPTCHA_SECRET` | hCaptcha → Secret key | 🔒 Sensible |
| 6 | `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys → **Publishable key TEST** (préfixe `pk_test_…`) | Publique |
| 7 | `STRIPE_SECRET_KEY` | Stripe → Developers → API keys → **Secret key TEST** (préfixe `sk_test_…`) | 🔒 **Sensible** |
| 8 | `STRIPE_WEBHOOK_SECRET` | (à remplir étape 5) — laisse vide pour l'instant ou mets `whsec_placeholder` | 🔒 Sensible |
| 9 | `RESEND_API_KEY` | Resend → API Keys | 🔒 Sensible |
| 10 | `RESEND_FROM_EMAIL` | Une adresse vérifiée Resend, ex. `Imperio Gallorum Sociatis <noreply@gallia.space>` | Config |
| 11 | `VITE_PUBLIC_BASE_URL` | Pour le 1er déploiement, mets `https://titulus-civilis.vercel.app` ou ton URL Vercel temporaire. Tu remplaces par `https://adherer.gallia.space` à l'étape 6. | Publique |

**Pour chaque variable** : le bouton « Add » coche par défaut Production / Preview / Development — laisse tel quel.

---

## 4. Premier déploiement (2 min)

1. Une fois toutes les variables saisies, clique **« Deploy »**
2. Vercel build le projet (1 à 2 minutes). Tu vois les logs en direct.
3. Quand c'est fini : URL temporaire genre `titulus-civilis-xxxx.vercel.app`. **Clique-la** : ton funnel est en ligne 🎉

---

## 5. Webhook Stripe (3 min)

Le webhook permet à Stripe de notifier ton site quand un paiement réussit.

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL** : `https://[ton-url-vercel].vercel.app/api/stripe/webhook` (ou plus tard `https://adherer.gallia.space/api/stripe/webhook`)
3. **Events to send** : sélectionne **`checkout.session.completed`**
4. **Add endpoint**
5. Sur la page de l'endpoint qui apparaît, clique **« Reveal »** sous **Signing secret** → copie la valeur (`whsec_…`)
6. Retourne dans Vercel → ton projet → **Settings** → **Environment Variables**
7. Trouve `STRIPE_WEBHOOK_SECRET`, clique l'icône **Edit**, colle la valeur, sauvegarde
8. Vercel propose un redéploiement → accepte

---

## 6. Connecter le domaine `adherer.gallia.space` (5 min)

### 6.a. Côté Vercel
1. Vercel → ton projet → **Settings** → **Domains**
2. Tape `adherer.gallia.space`, clique **Add**
3. Vercel te montre un enregistrement **CNAME** (généralement `cname.vercel-dns.com`)

### 6.b. Côté Hostinger DNS
1. Connecte-toi à hPanel Hostinger
2. **Domaines** → `gallia.space` → **DNS / Nameservers**
3. Ajoute un enregistrement :
   - Type : **CNAME**
   - Nom : `adherer`
   - Pointe vers : la valeur Vercel (ex. `cname.vercel-dns.com`)
   - TTL : `3600`
4. Sauvegarde
5. Retour sur Vercel — la config passe de « Invalid » à « Valid » sous 5–60 min
6. Vercel → **Settings** → **Environment Variables** → mets à jour `VITE_PUBLIC_BASE_URL` = `https://adherer.gallia.space`
7. Redéploie

À ce stade : **https://adherer.gallia.space** affiche ton funnel.

---

## 7. Test bout-en-bout (5 min)

1. Ouvre https://adherer.gallia.space dans une fenêtre privée (pour ne pas mélanger avec le mode dev)
2. Remplis l'étape I avec un faux nom + ton e-mail réel
3. Clique le CTA → tu arrives à l'étape II
4. Clique **« Procéder au paiement sécurisé »** → tu es redirigé vers Stripe
5. Carte de test Stripe : `4242 4242 4242 4242`, date future, CVC `123`, code postal `75001`
6. Stripe te renvoie sur l'étape III. Tu reçois un e-mail Resend.
7. Continue jusqu'à la fin → tu reçois le PDF Declaratio + l'e-mail final.

Vérifie aussi :
- Supabase → Table Editor → `titulus_sessions` : tu dois voir une nouvelle ligne avec status `KYC_TRANSMIS`
- Supabase → Storage → `kyc-temp/[uuid]/` : 3 fichiers (recto, selfie, preuve)

---

## 8. Bascule LIVE Stripe (quand tout est validé)

1. Stripe Dashboard → bascule en haut à droite **Test → Live**
2. Recopie tes nouvelles clés `pk_live_*` et `sk_live_*` dans Vercel Environment Variables (Production uniquement, surtout pas en Preview)
3. Refais l'étape 5 (webhook) sur l'environnement LIVE → mets le nouveau `whsec_*` dans Vercel
4. Redéploie

---

## 🆘 En cas de problème

- **Logs Vercel** : Dashboard → Deployments → clique le dernier → **Build Logs / Runtime Logs**
- **Logs API routes** : Vercel → ton projet → **Logs** (en temps réel)
- **Variable d'environnement manquante** : tu verras un message clair dans les logs API
- **DNS qui tarde** : utilise https://dnschecker.org/ pour vérifier la propagation

À chaque modification que je fais, `git push` met à jour le code et Vercel **redéploie automatiquement** en 1-2 minutes. Tu n'as rien à faire.
