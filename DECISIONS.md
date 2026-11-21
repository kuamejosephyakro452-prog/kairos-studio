# DECISIONS — KAIROS STUDIO (Phase 2 — Refonte Frontend Complète)

Journal des décisions créatives, typographiques, chromatiques, techniques et éditoriales prises de manière autonome.

---

## 1. Concept Directeur — « Du Signal Brut à l’Expérience Vivante »
- **Point de départ** : KAIROS est strictement un nom de marque (zéro référence à une quelconque étymologie dans les textes, animations, métadonnées ou transitions).
- **Idée directrice (voir `CONCEPT.md`)** : Traduire la signature *« Turning Ideas Into Experiences. »* et la convergence des **5 disciplines** (Design graphique · Production audiovisuelle · Communication digitale · Solutions numériques / TIC · Création de sites web) en une métamorphose continue :
  - **Signal** (Préchargeur & Hero) : tracé vectoriel du monogramme **JK**, shader GLSL liquide réactif au curseur, révélation cinétique du titre et proposition de valeur orientée client.
  - **Forme** (Manifeste & Scène 5 Disciplines) : illumination mot-à-mot au scroll, puis index monumental interactif des 5 métiers qui bascule dynamiquement la couleur ambiante et la scène visuelle sticky.
  - **Expérience** (Galerie multi-vues, Fondateur & Contact) : 3 modes d’exploration (**Galerie horizontale épinglée**, **Index liste avec traînée visuelle au curseur**, **Canevas libre glissable « Explorer »**), fiches projets structurées plein écran et conversion fluide (Formulaire Supabase + WhatsApp flottant + E-mail direct).
- **Zéro invention** : Aucune année, aucun client, aucun chiffre, aucun témoignage, aucun lien de réseau social, aucun portrait factice.

---

## 2. Direction Chromatique — Palette Unique « Encre & Vermillon »
La palette définitive **« Encre & Vermillon »** est implémentée en **tokens CSS centralisés** (`src/styles/index.css` : `--bg-primary`, `--bg-elevated`, `--bg-card`, `--text-primary`, `--text-muted`, `--accent-1`, `--accent-2`, `--accent-3`, `--grad-signature`, `--accent-text`, `--accent-on-solid`, `--glow-primary`, `--border-subtle`) :

- **« Encre & Vermillon »** : Papier chaud `#F3EEE6`, carte `#FAF6F0`, encre `#0F0F12`, vermillon `#E8392B`, vert-bleu profond `#0F4C4A`.
- **Accessibilité (AA minimum)** : Contraste vérifié sur l'ensemble des textes, boutons dégradés (`--accent-on-solid: #FAF6F0`) et surfaces verre.
- **Unicité visuelle** : Aucune commutation de couleur n'est exposée au visiteur.

---

## 3. Typographie — Polices Variables Auto-Hébergées & Choix du Duo
Zéro appel Google Fonts externe (confidentialité + performance LCP). Trois directions display ont été comparées sur captures réelles (Cycle 1) :
1. **Syne Variable** (géométrique avant-gardiste, personnalité immédiate de studio primé) — **Retenue pour le Display**.
2. **Bricolage Grotesque Variable** (très chaleureuse et éditoriale, mais silhouette légèrement plus classique/institutionnelle que Syne).
3. **Fraunces Variable** (serif optique très expressive — excellente en touche italique contrastée, trop chargée en display intégral).

**Système final retenu** (et polices non retenues purgées du bundle) :
- **Titres Display** : `@fontsource-variable/syne` (graisses 600–800, interlignage serré `0.92–0.98`, tracking négatif `-0.03em`).
- **Accents éditoriaux ponctuels** : `@fontsource-variable/fraunces` (italiques expressifs sur les sous-titres/accroches).
- **Corps & UI** : `@fontsource-variable/space-grotesk` (géométrie contemporaine, lisibilité irréprochable sur mobile).
- **Index, coordonnées & métadonnées** : `@fontsource-variable/jetbrains-mono` (numérotations `01`, `X/Y`, étiquettes techniques).

---

## 4. Ressources Locales, Contenus `origine_non_verifiee` & Vidéos `demo`
- **Lecture seule absolue** sur `D:\MON STUDIO` et `D:\MON_STUDIO_VIDEO` (aucun original modifié ou déplacé).
- **Catalogue publié (11 réalisations couvrant les 5 catégories) + 2 brouillons privés** :
  - **3 créations vérifiées** (`origine_non_verifiee = false, demo = false`) : *Pub Nexora Tech*, *Digital Creativity 2026*, *Soirée de Louange — Une Nuit dans Sa Présence*.
  - **5 réalisations ajoutées depuis `D:\MON STUDIO\04_TEMPLATES`** (`origine_non_verifiee = true`, recadrées sans bordures de présentation, converties AVIF + WebP responsives) pour illustrer les 5 disciplines : *Brand Guidelines*, *Natur Packaging*, *Someone Somewhere Needs Your Solution* (Solutions numériques / TIC), *E-Commerce Training Session* (Création de sites web), *Delicious Burger — Campagne Food*. Filtrables en un clic dans `/admin` via le filtre **« Origine non vérifiée »**.
  - **3 vidéos de démonstration temporaires** (`demo = true`, libres de droits Pexels License issues de `D:\MON_STUDIO_VIDEO\02_RESSOURCES_VIDEO\B_Roll\`, documentées dans `DEMO_ASSETS.md`, stockées dans `public/media/demo/`, titres neutres sans aucune invention). Supprimables **globalement en un clic** depuis `/admin` via **« Supprimer tout le contenu de démonstration »**.

---

## 5. Boucles de Qualité Visuelle (3 Cycles Complets)
- **Audit initial (`AUDIT_FRONTEND.md`)** : captures de la V1 conservées dans `docs/avant-apres/avant_*.png`.
- **Cycle 1 (Couleurs + Polices + Hero)** :
  - Corrigé le chevauchement potentiel entre la barre basse du Hero et le bouton WhatsApp flottant (`pb-20 sm:pb-24` + repère de scroll centré).
  - Renforcé le contraste texte sur dégradé CTA.
  - Purgé les packages de polices non retenues (`bricolage-grotesque`, `plus-jakarta-sans`) pour alléger le bundle.
- **Cycle 2 (QA Interactif complet Desktop 1440px & Mobile 390px)** :
  - Identifié 4 défauts majeurs et 5 ajustements : synchronisation Supabase (3 → 11 projets), comportement `ScrollTrigger` pinned horizontal lors du chargement asynchrone, dégagement de la barre latérale sticky sur la fiche projet, coupure de mot du wordmark géant en pied de page sur mobile (`KAIROS S / TUDIO`), chevauchement des glyphes `404` avec le H1, et traduction des `aria-label` en anglais.
- **Cycle 3 & 4 (Correctifs de fond, Sync Live Supabase & Re-vérification complète)** :
  - Migration Phase 2 (`origine_non_verifiee`, `demo`, policy Storage `demo/%`) + upsert des 13 projets appliqués en direct sur Supabase `lpenmdantrekfhyehbyp` (vérification `anon` : 11 publiés sur 5 catégories, 0 brouillon).
  - **Fix racine `.page-transition`** (`src/styles/index.css`) : retrait du `transform: translateY(0)` maintenu par `animation-fill-mode: both`, qui créait un bloc englobant perturbant `position: fixed` et `position: sticky`.
  - **`WorksShowcase.tsx` (Galerie horizontale)** : passage à une architecture **CSS `position: sticky` + GSAP ScrollTrigger `scrub`** (sans `pin: true` / `.pin-spacer`), garantissant 0 disparition DOM sous React 19 et un défilement horizontal fluide sur les créations.
  - **`FullscreenNav.tsx`** : en-tête lisible et pilule active en dégradé signature (`bg-accent-gradient`) à contraste garanti.
  - `ProjectDetailPage.tsx` : `lg:sticky lg:top-32` sous la navigation fixe.
  - `Footer.tsx` : groupement par mot (`inline-flex whitespace-nowrap`) empêchant toute coupure interne de `KAIROS` ou `STUDIO` sur mobile.
  - `NotFoundPage.tsx` : `404` en `font-mono-tech text-accent-gradient` + marge `mt-3`.
  - `WorksShowcase.tsx` : `aria-label` et `title` 100 % traduits FR/EN.
  - `ServicesStage.tsx` : support `onFocus` clavier aligné avec le survol/clic.

---

## 6. Architecture, SEO & Sécurité (Préservés & Renforcés)
- **Stack** : React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + GSAP/ScrollTrigger + Lenis + Shader WebGL GLSL natif (< 3 Ko, chargement différé `requestIdleCallback`, repli CSS sur mobile et `prefers-reduced-motion`).
- **Prérendu statique GitHub Pages** : `scripts/prerender.mjs` génère un `index.html` dédié par route publique (toutes les fiches projets FR/EN, accueil FR/EN, pages légales) + `404.html` SPA + `sitemap.xml` (excluant `/admin`) + `robots.txt`.
- **Supabase (`lpenmdantrekfhyehbyp`, région `eu-west-1`)** :
  - Inscriptions publiques désactivées (`disable_signup: true`), admin unique `kuamejosephyakro452@gmail.com` dans `public.admin_users`.
  - RLS strict sur `projects`, `contact_messages`, `admin_users` et bucket `portfolio-media`.
  - Maintien en vie automatique via `.github/workflows/keep-supabase-alive.yml` + repli instantané sur `src/data/projects.snapshot.ts`.
