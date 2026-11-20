# DECISIONS — KAIROS STUDIO

Journal des décisions créatives, éditoriales, techniques et d'architecture prises de manière autonome.

---

## 1. Architecture & Stack Technique
- **Framework** : **React 19 + TypeScript + Vite 6** avec routage complet (`react-router-dom`) et **script de prérendu statique (SSG)** en post-build générant un `index.html` dédié pour chaque route publique (`/`, `/fr`, `/en`, fiches projets FR/EN, pages légales FR/EN) + `404.html` de secours pour GitHub Pages.
  - *Raison* : Permet à la fois un chargement instantané, un SEO complet (balises `<title>`, `description`, `hreflang`, Open Graph, JSON-LD présents dans le HTML statique), le rechargement direct sur toute URL profonde sur GitHub Pages, et une SPA riche pour l'espace d'administration (`/admin`).
- **Base path GitHub Pages** : Configurable via `VITE_BASE_PATH` (défaut `/kairos-studio/`), compatible avec un futur passage sur domaine personnalisé (`/`).
- **Animations & Smooth Scroll** : **GSAP + ScrollTrigger** + **Lenis** (activé sur desktop hors `prefers-reduced-motion`). Préchargeur élégant dessinant le monogramme vectoriel **JK** en traits dorés avant révélation fluide (skippable / instantané si `prefers-reduced-motion`).
- **Effet WebGL maîtrisé** : Shader GLSL natif léger (< 3 Ko, sans dépendance Three.js lourde) sur `<canvas>` dans le hero, rendu en différé (`requestIdleCallback`), désactivé automatiquement sur mobile basse capacité ou `prefers-reduced-motion`. Assure un rendu cinématographique d'aurore dorée/encre tout en préservant un score Lighthouse Performance ≥ 85.
- **Résilience Supabase (Plan gratuit / Auto-pause)** :
  - Instantané statique `src/data/projects.snapshot.ts` (généré/mis à jour au build à partir de Supabase si disponible, ou depuis le catalogue initial vérifié).
  - Le site public affiche instantanément les projets depuis l'instantané statique puis fusionne silencieusement les mises à jour en direct depuis Supabase (`projects` où `status = 'published'`). Ainsi le portfolio reste 100 % fonctionnel même si Supabase est en pause ou hors-ligne.
  - Workflow GitHub Actions hebdomadaire (`.github/workflows/keep-supabase-alive.yml`) pour envoyer un ping léger à l'API REST publique afin d'éviter la mise en pause automatique.

## 2. Direction Artistique — « Editorial & Luxury »
- **Fil conducteur narratif (Kairos)** : Le *Kairos* — l'instant juste où une idée bascule en expérience mémorable. Traduit visuellement par des révélations mesurées, des filets dorés précis, des numérotations éditoriales (`01` → `05`), et un rythme contrasté alternant **Ivoires chauds (`#F4EEE3` / `#E6DACA`)** et **Noirs d'encre (`#0B0B0C`)**, ponctués d'un **Or brossé (`#B8913F` → `#E8C877`)**.
- **Thème clair / sombre** : Le design par défaut repose sur une alternance éditoriale maîtrisée (Hero cinéma sombre → Manifeste & Services ivoire → Galerie & Fondateur noir encre → Compétences & Contact ivoire/sable) et offre un sélecteur de thème complet (Éditorial Clair / Nocturne Sombre) mémorisé dans `localStorage`, tout en respectant un contraste AA partout.
- **Typographies libres** :
  - Display / Titres : **Cormorant Garamond** (italiques sculpturaux et graisses 300/400/500/600) + **Instrument Serif** pour les accents éditoriaux.
  - Corps & Interface : **Manrope** (lisibilité exemplaire à petite et moyenne taille, précision géométrique contemporaine).
- **Zéro invention** : Aucune année, aucun client, aucun chiffre, aucun témoignage, aucun lien social ni numéro d'immatriculation inventé.

## 3. Sélection des Créations Locales (Règle de Lecture Seule)
- Dossiers scannés en lecture seule absolue : `D:\MON STUDIO` et `D:\MON_STUDIO_VIDEO` (ainsi que vérification du workspace local).
- **Publiés sur le site public (3 projets authentiques, haute qualité, 0 doublon)** :
  1. **Pub Nexora Tech** (`Production audiovisuelle`) — Film publicitaire Full HD 16:9 (compressé MP4/WebM pour le web + poster + extraits HD + showreel Hero muet 12s).
  2. **Digital Creativity 2026** (`Design graphique`) — Affiche événementielle A3 300 DPI + déclinaison Instagram 4:5 + emblème vectoriel DC//26.
  3. **Soirée de Louange — Une Nuit dans Sa Présence** (`Communication digitale`) — Campagne visuelle réseaux sociaux en double format (Carré 1:1 + Statut WhatsApp 9:16 avec zones de sécurité).
- **Placés en BROUILLON dans l'admin (non visibles sur le site public, modifiables/publiables par Joseph)** :
  1. **Soirée Talents & Quiz Biblique** — Affiche A4 de grande qualité présente dans le workspace racine mais hors `D:\MON STUDIO` et comportant une mention « Date : À préciser » sur l'image. Placée en brouillon par rigueur éditoriale.
  2. **Packshot & Identité Visuelle Nexora** — Planches de direction visuelle (logo + packshot) déjà incluses en galerie de la fiche vidéo, disponibles séparément en brouillon si Joseph souhaite les exposer comme projet Design Graphique indépendant.
  3. **Emblème Vectoriel DC//26** — Déclinaison logotype vectorielle issue du projet Digital Creativity 2026, disponible en brouillon.
- **Écartés** : Toutes les bibliothèques tierces (`02_RESSOURCES`, `04_TEMPLATES`, `07_DOCUMENTATION`, `01_RESSOURCES_GRAPHIQUES`, `02_RESSOURCES_VIDEO`, `03_RESSOURCES_AUDIO`, `04_TEMPLATES`, `08_REFERENCES_INSPIRATION`, `09_OUTILS_ET_SCRIPTS`) et tous les fichiers dupliqués (triplons vidéo, doublons workspace).

## 4. Pipeline Médias & Optimisation Poids
- **Images** : Générées par script reproductible (`scripts/process-media.mjs` avec `sharp`) en **AVIF + WebP** (fallback JPG/WebP) dans 3 largeurs responsives (`480w`, `960w`, `1600w`) + miniatures.
- **Vidéos** : Encodées via FFmpeg (`imageio_ffmpeg`) à partir des copies en lecture seule :
  - `hero-showreel.mp4` (H.264 720p, muet, ~12 s, < 2.5 Mo) + `hero-showreel.webm` (VP9) + `hero-showreel-poster.webp/.avif`.
  - `pub-nexora-tech.mp4` (H.264 720p avec audio AAC 128k, ~120 s, < 14 Mo) + `pub-nexora-tech.webm` (< 12 Mo) + poster HD + 4 stills HD.
- Respect strict des limites GitHub Pages (site total très largement inférieur à 100 Mo, aucun fichier supérieur à 15 Mo) et du quota gratuit Supabase (~1 Go).

## 5. Sécurité & Administration Supabase
- Tables : `projects`, `project_media`, `contact_messages`, `admin_profiles` (ou contrôle strict via `auth.uid()` et rôle admin unique).
- Inscriptions publiques désactivées dans Supabase Auth ; un seul compte administrateur (`kuamejosephyakro452@gmail.com`).
- RLS activé sur **toutes** les tables et **tous** les buckets Storage (`portfolio-media`) :
  - `projects` & `project_media` : `SELECT` public limité à `status = 'published'` ; `INSERT/UPDATE/DELETE` et `SELECT` complet (incluant `draft`) réservés à l'utilisateur authentifié administrateur.
  - `contact_messages` : `INSERT` autorisé au public (avec validation stricte + honeypot + rate-limit applicatif) ; `SELECT/UPDATE/DELETE` réservés à l'administrateur authentifié.
  - Bucket `portfolio-media` : lecture publique des fichiers publiés ; écriture/suppression réservées à l'administrateur authentifié.
- Route `/admin` marquée `<meta name="robots" content="noindex, nofollow">` et exclue de `sitemap.xml`.
