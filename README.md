# KAIROS STUDIO — Portfolio Officiel

> **Turning Ideas Into Experiences.**  
> Portfolio créatif et numérique de **Joseph Kouamé**, Fondateur & Directeur créatif.

---

## 1. Architecture & Expérience Front-End (Phase 2)

- **Front-end** : React 19 + TypeScript + Vite 6 + Tailwind CSS v4
- **Routage bilingue** : `/fr` (par défaut, `/` redirige vers `/fr`), `/en`, `/fr/projets/:slug`, `/en/projects/:slug`, `/fr/mentions-legales`, `/en/legal-notice`, `/fr/confidentialite`, `/en/privacy`, `/admin` (privé, `noindex`).
- **Direction visuelle — « Du Signal Brut à l’Expérience Vivante »** (`CONCEPT.md`) :
  - **Palette unique « Encre & Vermillon » en tokens CSS centralisés** (`src/styles/index.css`) : papier chaud `#F3EEE6`, encre `#0F0F12`, vermillon `#E8392B`, vert-bleu profond `#0F4C4A`.
  - **Typographies variables auto-hébergées** (`@fontsource-variable`) : **Syne** (Display), **Space Grotesk** (Corps & UI), **Fraunces** (accents italiques) et **JetBrains Mono** (index & coordonnées) — aucune requête Google Fonts externe.
- **Animations & interactions** :
  - Préchargeur vectoriel traçant le monogramme **JK** avec compteur `000→100` (une fois par session, désactivé si `prefers-reduced-motion`).
  - Hero plein écran : shader **WebGL GLSL** liquide réactif au curseur (chargé en différé via `requestIdleCallback`, repli mesh CSS sur mobile), monogramme **JK** 3D interactif et showreel vidéo muet.
  - Smooth scroll **Lenis** synchronisé avec **GSAP + ScrollTrigger** (desktop uniquement).
  - Scène des 5 disciplines à changement d’ambiance chromatique en direct.
  - **3 modes d’exploration des réalisations** : **Galerie** (défilement horizontal épinglé sur desktop / grille fluide sur mobile), **Index** (liste avec prévisualisation flottante suivant le curseur) et **Explorer** (canevas libre glissable au pointeur/doigt).
  - Curseur contextuel (`VOIR`, `LIRE`, `GLISSER`, `ZOOM`), boutons magnétiques, barre de progression de lecture et wordmark géant réactif lettre par lettre en pied de page.
- **Médias optimisés** :
  - Images locales pré-converties en **AVIF + WebP** responsives (`480w`, `960w`, `1400w/1600w`) via `scripts/process-media.mjs` et `scripts/process-phase2-images.mjs`.
  - Vidéos locales compressées en **MP4 (H.264 `faststart`) + WebM (VP9)** (dont 3 vidéos de démonstration temporaires Pexels dans `public/media/demo/`, documentées dans `DEMO_ASSETS.md`).
- **SEO & Prérendu statique (GitHub Pages)** :
  - `scripts/prerender.mjs` génère un `index.html` dédié pour chaque route publique avec `<title>`, `description`, `canonical`, `hreflang` (`fr`/`en`/`x-default`), Open Graph, Twitter Cards et JSON-LD.
  - `404.html` assure le rechargement profond de toute route SPA ; `sitemap.xml` (excluant `/admin`) et `robots.txt` sont générés automatiquement.

---

## 2. Espace d'Administration (`/admin`) & Connexion GitHub OAuth

1. **Connexion principale par GitHub (OAuth 2.0 PKCE)** : ouvrez `/admin` et cliquez sur **« Se connecter avec GitHub »**. L'authentification passe par Supabase Auth (`flowType: 'pkce'`). Une connexion de secours par e-mail et mot de passe reste disponible dans un panneau repliable, verrouillée sur ce même compte unique.
2. **Configuration GitHub OAuth + Supabase Dashboard** *(aucun secret dans le dépôt)* :
   - Dans **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App** :
     - **Homepage URL** : `https://kuamejosephyakro452-prog.github.io/kairos-studio/`
     - **Authorization callback URL** : `https://lpenmdantrekfhyehbyp.supabase.co/auth/v1/callback`
   - Dans **Supabase Dashboard → Authentication → Providers → GitHub** :
     - Activer **GitHub Enabled** et saisir le **Client ID** et le **Client Secret** générés par GitHub.
   - Dans **Supabase Dashboard → Authentication → URL Configuration** :
     - **Site URL** : `https://kuamejosephyakro452-prog.github.io/kairos-studio/admin`
     - **Redirect URLs** :
       - `https://kuamejosephyakro452-prog.github.io/kairos-studio/admin`
       - `https://kuamejosephyakro452-prog.github.io/kairos-studio/*`
       - `http://localhost:5173/kairos-studio/admin`
       - `http://localhost:4173/kairos-studio/admin`
   - Dans **Supabase Dashboard → Authentication → Providers → Email / User Signups** :
     - Vérifier que **Allow new users to sign up** reste **DÉSACTIVÉ** (`disable_signup: true`), afin que tout autre compte GitHub soit bloqué dès l'authentification.
   - Vérification côté base de données (RLS) : seul l'unique compte présent dans `public.admin_users` (`kuamejosephyakro452@gmail.com` / `kuamejosephyakro452-prog`) dispose des droits admin ; tout autre compte authentifié est immédiatement déconnecté et bloqué par les règles RLS PostgreSQL (`supabase/migrations/20261121_github_oauth_single_admin.sql`).
3. **Filtres rapides** : *Tous*, *Publiés*, *Brouillons*, **Origine non vérifiée** (`origine_non_verifiee = true`) et **Démo** (`demo = true`).
4. **Vérifier les pièces ajoutées (`Origine non vérifiée`)** : filtrez sur **Origine non vérifiée**, ouvrez chaque fiche pour confirmer sa paternité (décochez la case), la renommer ou la dépublier/supprimer.
5. **Supprimer tout le contenu de démonstration en un clic** : cliquez sur le bouton dédié **« Supprimer tout le contenu de démonstration »** en haut de l’administration pour effacer instantanément toutes les entrées marquées `demo = true` en base (et les éventuels fichiers dans `demo/` sur Supabase Storage). Pour retirer également les fichiers statiques du dépôt, supprimez le dossier `public/media/demo/` et les 3 entrées `demo: true` dans `src/data/projects.snapshot.ts`.
6. **Médias & Messages** : import direct d’images/vidéos dans le bucket Supabase Storage `portfolio-media` (plafond 25 Mo/fichier) et gestion complète des messages reçus via le formulaire de contact.

---

## 4. Variables d'environnement & Sécurité

Copiez `.env.example` vers `.env.local` pour le développement local (ne committez **jamais** `.env*`).

| Variable | Obligatoire | Description |
| :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | Pour admin & DB live | URL publique du projet Supabase `kairos-studio` |
| `VITE_SUPABASE_ANON_KEY` | Pour admin & DB live | Clé publique **anon** uniquement (jamais `service_role` ni `SUPABASE_ACCESS_TOKEN`) |
| `VITE_BASE_PATH` | Non | Chemin de base Vite (`/kairos-studio/` pour GitHub Pages, `/` pour un domaine personnalisé) |
| `VITE_SITE_URL` | Non | URL canonique publique utilisée pour sitemap, canonical et Open Graph |

> **Sécurité** : Seule la clé publique `anon` figure côté client. Toutes les opérations d’écriture, la lecture des brouillons et les messages de contact sont verrouillés côté serveur par **Row Level Security (RLS)** et `public.admin_users`.

---

## 5. Quotas, Sauvegarde & Domaine personnalisé

- **GitHub Pages** : site complet ~50 Mo (limite ~1 Go), plus gros fichier ~14,3 Mo (limite 100 Mo).
- **Supabase gratuit** : base 500 Mo, Storage 1 Go (plafond 25 Mo/fichier), état vérifié actif (non en pause). L'auto-pause est prévenue par `.github/workflows/keep-supabase-alive.yml` (exécution tous les 4 jours avec contrôle strict `HTTP 200` sur `/auth/v1/health` et `/rest/v1/projects`, retries automatiques et alerte d'échec si le projet est injoignable) et mitigée côté public par l’instantané statique `src/data/projects.snapshot.ts`.
- **Optimisation connexion & RLS Admin** : l'administration (`/admin`) préchauffe la connexion TLS à l'ouverture, déduplique les appels de session/rôle (`admin_users`), distingue strictement les erreurs d'identifiants, limitation de tentatives (`429`), réseau/serveur (`5xx`) et délai dépassé (`timeout`), et charge les messages de contact à la demande. La migration non destructive `supabase/migrations/20261121_admin_perf_indexes.sql` peut être appliquée dans le SQL Editor Supabase pour ajouter les index dédiés et le pattern RLS InitPlan.
- **Domaine personnalisé** : configurez le domaine dans **GitHub Settings → Pages**, pointez les enregistrements DNS (`A` + `CNAME www`), définissez `VITE_BASE_PATH=/` et `VITE_SITE_URL=https://votre-domaine.com` dans **GitHub Actions Variables**, puis relancez le déploiement.

---

## 6. Commandes utiles

```bash
npm run dev           # Serveur local de développement
npm run build         # TypeScript + Build Vite + Prérendu SEO statique
npm run test:smoke    # Contrôle intégrité (routes, SEO, poids, absence de secrets et textes interdits)
npm run media:videos  # Ré-encode les vidéos locales (lecture seule sur D:\MON_STUDIO_VIDEO)
npm run media:images  # Régénère WebP/AVIF responsives (lecture seule sur D:\MON STUDIO)
```
