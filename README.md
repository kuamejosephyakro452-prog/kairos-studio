# KAIROS STUDIO — Portfolio Officiel

> **Turning Ideas Into Experiences.**  
> Portfolio créatif et numérique de **Joseph Kouamé**, Fondateur & Directeur créatif.

---

## 1. Architecture technique

- **Front-end** : React 19 + TypeScript + Vite 6 + Tailwind CSS v4
- **Routage bilingue** : `/fr` (par défaut, `/` redirige vers `/fr`), `/en`, `/fr/projets/:slug`, `/en/projects/:slug`, `/fr/mentions-legales`, `/en/legal-notice`, `/fr/confidentialite`, `/en/privacy`, `/admin` (privé, `noindex`).
- **Mouvement & ambiance** :
  - Préchargeur vectoriel dessinant le monogramme **JK** (une fois par session, skippé si `prefers-reduced-motion`).
  - Smooth scroll **Lenis** synchronisé avec **GSAP + ScrollTrigger** (desktop uniquement).
  - Shader WebGL GLSL léger (< 3 Ko) dans le Hero, chargé en différé (`requestIdleCallback`), désactivé sur mobile.
  - Curseur éditorial personnalisé & boutons magnétiques (desktop uniquement).
  - Bascule thème **Éditorial Clair / Nocturne Sombre** mémorisée dans `localStorage`.
- **Médias optimisés** :
  - Images locales pré-converties en **AVIF + WebP** en 3 largeurs responsives (`480w`, `960w`, `1600w`) via `scripts/process-media.mjs` (`sharp`).
  - Vidéos locales compressées en **MP4 (H.264 `faststart`) + WebM (VP9/VP8)** via `scripts/process-videos.py` (FFmpeg), incluant un showreel muet Hero de ~1 Mo.
- **SEO & Prérendu statique (GitHub Pages)** :
  - `scripts/prerender.mjs` génère un `index.html` dédié pour chaque route publique avec `<title>`, `description`, `canonical`, `hreflang` (`fr`/`en`/`x-default`), Open Graph, Twitter Cards et JSON-LD.
  - `404.html` assure la continuité SPA lors du rechargement direct sur toute URL profonde.
  - `sitemap.xml` (excluant `/admin`) et `robots.txt` générés automatiquement.
- **Résilience Supabase (Plan gratuit)** :
  - Instantané statique embarqué (`src/data/projects.snapshot.ts`) permettant au site public de rester 100 % fonctionnel même si Supabase est en pause.
  - Fusion automatique avec les projets publiés Supabase en direct dès que le projet est actif.
  - Workflow GitHub Actions planifié (`.github/workflows/keep-supabase-alive.yml`) envoyant un ping léger tous les 4 jours.

---

## 2. Variables d'environnement

Copiez `.env.example` vers `.env.local` pour le développement local (ne committez **jamais** `.env*`).

| Variable | Obligatoire | Description |
| :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | Pour admin & formulaire DB | URL publique du projet Supabase `kairos-studio` |
| `VITE_SUPABASE_ANON_KEY` | Pour admin & formulaire DB | Clé publique **anon** uniquement (jamais `service_role` ni `SUPABASE_ACCESS_TOKEN`) |
| `VITE_BASE_PATH` | Non | Chemin de base Vite (`/kairos-studio/` pour GitHub Pages, `/` pour un domaine personnalisé) |
| `VITE_SITE_URL` | Non | URL canonique publique utilisée pour le sitemap, canonical et Open Graph |

> **Sécurité** : Seule la clé publique `anon` peut figurer côté client. Toutes les opérations d'écriture sont verrouillées côté serveur par **Row Level Security (RLS)** et la table `public.admin_users`.

---

## 3. Guide d'utilisation — Espace d'Administration (`/admin`)

1. Ouvrez l'URL privée d'administration (`/admin`).
2. Connectez-vous avec votre unique compte administrateur (`kuamejosephyakro452@gmail.com`). Les inscriptions publiques sont désactivées dans Supabase Auth.
3. **Ajouter un projet** :
   - Cliquez sur **Nouveau projet**.
   - Renseignez la catégorie, le statut (**Brouillon** pour préparer en privé ou **Publié** pour afficher immédiatement), le slug (généré automatiquement) et les textes **FR / EN**.
   - Les champs *Client*, *Année* et *Rôle* sont optionnels : s'ils restent vides, rien n'est affiché sur le site public.
4. **Charger des images et vidéos depuis votre ordinateur** :
   - Dans la section **Médias**, utilisez les boutons **Charger une image (WebP/PNG/JPG)**, **Charger MP4 / WebM** ou **Ajouter une image à la galerie**.
   - Les fichiers sont envoyés dans le bucket Supabase Storage `portfolio-media` (plafond 25 Mo/fichier).
   - **Recommandation** : privilégiez le WebP (< 500 Ko par image) et le MP4 720p (< 15 Mo par vidéo) afin de préserver durablement le quota gratuit (~1 Go).
5. **Publier, dépublier, réordonner, supprimer** :
   - Utilisez les boutons fléchés **Monter / Descendre** pour changer l'ordre d'apparition dans la galerie.
   - Cliquez sur **Publier / Dépublier** pour basculer instantanément un projet entre public et brouillon (ex. les brouillons pré-chargés).
6. **Consulter les messages reçus** :
   - Ouvrez l'onglet **Messages** pour lire les demandes du formulaire de contact, marquer comme lu, répondre directement par e-mail ou WhatsApp, ou supprimer.

---

## 4. Configuration initiale de Supabase (`kairos-studio`)

1. Dans votre compte Supabase existant (lié à GitHub), créez un nouveau projet nommé **`kairos-studio`** (plan gratuit, région la plus proche).
2. Dans **Authentication → Providers → Email** : **désactivez « Allow new users to sign up »**.
3. Dans **Authentication → Users** : créez manuellement l'unique utilisateur `kuamejosephyakro452@gmail.com` avec un mot de passe fort (et activez la **2FA TOTP** sur votre compte Supabase).
4. Dans **SQL Editor**, exécutez dans l'ordre :
   - `supabase/schema.sql` (crée `admin_users`, `projects`, `contact_messages`, toutes les politiques RLS et le bucket `portfolio-media`).
   - `supabase/seed.sql` (insère les 3 projets publiés et les 2 brouillons vérifiés).
   - Puis liez votre compte admin :
     ```sql
     insert into public.admin_users (user_id, email)
     select id, email from auth.users where email = 'kuamejosephyakro452@gmail.com'
     on conflict (user_id) do nothing;
     ```
5. Dans le dépôt GitHub **Settings → Secrets and variables → Actions → Variables**, ajoutez :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Relancez le workflow **Deploy KAIROS STUDIO to GitHub Pages** (onglet Actions).

---

## 5. Quotas, limites & stratégie de sauvegarde

### Limites GitHub Pages (gratuit)
- Taille recommandée du site publié : **≤ 1 Go** (actuellement < 35 Mo).
- Taille maximale par fichier Git : **100 Mo** (plus gros fichier actuel : ~14,3 Mo).
- Bande passante douce : **100 Go / mois**.

### Quota Supabase (plan gratuit)
- Base PostgreSQL : **500 Mo** (largement suffisant pour des milliers de projets et messages).
- Storage : **1 Go** (plafond applicatif configuré à **25 Mo par fichier** dans le bucket `portfolio-media`).
- Auto-pause après 7 jours d'inactivité : prévenue par le workflow `.github/workflows/keep-supabase-alive.yml` tous les 4 jours, ET mitigée par l'instantané statique côté site public.

### Sauvegarde
- Les fichiers originaux restent intacts en lecture seule sur `D:\MON STUDIO` et `D:\MON_STUDIO_VIDEO`.
- Le code source, les schémas SQL (`supabase/schema.sql`, `supabase/seed.sql`) et les médias de base sont versionnés dans Git.
- Pour sauvegarder la base Supabase ponctuellement : export CSV/JSON depuis **Supabase Dashboard → Table Editor** ou `pg_dump`.

---

## 6. Brancher un domaine personnalisé plus tard

1. Achetez ou configurez votre domaine (ex. `kairos-studio.com`).
2. Dans **GitHub → Repository Settings → Pages → Custom domain**, saisissez votre domaine et cochez **Enforce HTTPS**.
3. Configurez chez votre registrar DNS les enregistrements `A` pointant vers les IP GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) et un `CNAME` `www` vers `kuamejosephyakro452-prog.github.io`.
4. Dans **GitHub → Settings → Variables → Actions**, définissez :
   - `VITE_BASE_PATH` = `/`
   - `VITE_SITE_URL` = `https://kairos-studio.com`
5. Relancez le workflow de déploiement GitHub Actions.

---

## 7. Commandes utiles

```bash
npm run dev           # Serveur local de développement
npm run build         # Vérification TypeScript + Build Vite + Prérendu SEO
npm run test:smoke    # Contrôle d'intégrité (routes, SEO, poids, absence de secrets)
npm run media:videos  # Ré-encode les vidéos locales (lecture seule)
npm run media:images  # Régénère WebP/AVIF responsives (lecture seule)
```
