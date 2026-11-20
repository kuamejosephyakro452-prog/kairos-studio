# CONCEPT DIRECTEUR — KAIROS STUDIO (Phase 2)

> **Marque** : KAIROS STUDIO  
> **Signature** : *Turning Ideas Into Experiences.*  
> **Fondateur** : Joseph Kouamé — Fondateur & Directeur créatif (Monogramme **JK**)  
> **Règle stricte** : « KAIROS » est uniquement le nom de marque. Aucune référence à son étymologie ou à sa signification.

---

## 1. Idée directrice : « DE LA MATIÈRE BRUTE À L'EXPÉRIENCE VIVANTE » (*Signal → Forme → Expérience*)

Tout ce que réalise KAIROS STUDIO — une affiche, un film publicitaire, une campagne sociale, un outil numérique ou un site web — suit le même geste fondateur : **prendre une idée encore informe et lui donner une présence visuelle, cinétique et interactive impossible à ignorer.**

Cette idée directrice structure l'intégralité du design, du vocabulaire et du mouvement :
- **La tension entre précision technique et émotion sensible** : des repères d'atelier ultra-précis (coordonnées monospace, filets de cadrage, compteurs de frames, étiquettes techniques) rencontrent des matières vibrantes (shaders fluides WebGL, lumières chaudes, typographie monumentale, images plein cadre).
- **L'objet signature `JK`** : le monogramme de Joseph Kouamé incarne cette métamorphose :
  1. Dans le **préchargeur**, il s'esquisse au trait pur pendant que le compteur progresse de `00` à `100`.
  2. Dans le **Hero**, il devient une **sculpture lumineuse interactive / champ de force réactif au curseur** au-dessus d'un shader fluide WebGL (fluide chromatique organique avec distorsion au mouvement).
  3. Dans la section **Fondateur**, il s'ancre comme une pièce d'architecture graphique réactive à l'inclinaison du pointeur.

---

## 2. Émotions visées & promesse client
- **Première seconde (0–3 s)** : *« Ce studio joue dans la cour des grands. »* — impact visuel immédiat, profondeur lumineuse, typographie sculpturale, promesse limpide : ce que fait le studio (design, film, digital, web, TIC), pour les marques et organisations ambitieuses, avec deux actions immédiates (**Démarrer un projet** / **Voir les réalisations**).
- **Exploration (scroll)** : sensation de fluidité cinématographique maîtrisée (Lenis + GSAP ScrollTrigger), rythme varié où chaque scène surprend sans jamais fatiguer ni bloquer le clic.
- **Confiance & conversion** : études de cas structurées, visuels grand format propres, aucune donnée inventée, contact ultra-simple (formulaire + accès WhatsApp permanent).

---

## 3. Chorégraphie des 7 scènes de la page d'accueil

1. **Préchargeur (`Preloader`)** :
   - Tracé vectoriel progressif du monogramme `JK` + compteur `00 → 100` en monospace + signature *Turning Ideas Into Experiences.*, puis rideau de révélation rapide (`< 1,8 s`, 1 seule fois par session, skippé si `prefers-reduced-motion`).
2. **Scène 1 — Hero Cinématographique (`HeroSection`)** :
   - Fond **Shader WebGL GLSL temps réel** (fluide organique multi-couches + distorsion au curseur + micro-grain de film, chargé en différé avec repli CSS mesh gradient haute qualité pour mobile/low-power).
   - **Monogramme JK interactif** à droite / en profondeur (parallaxe 3D magnétique + anneaux orbitaux réactifs au pointeur).
   - Titre massif (`clamp(3rem, 8.8vw, 8.2rem)`), accroche orientée client directe, capsule **Showreel muet** en lecture continue, doubles CTA magnétiques, indicateur de défilement animé.
3. **Scène 2 — Manifeste Cinétique (`ManifestoSection`)** :
   - Phrase monumentale sur toute la largeur dont **chaque mot s'illumine au fil du défilement** (`ScrollTrigger` scrub), exprimant le passage de l'idée brute à l'expérience concrète (design, film, digital, web).
4. **Scène 3 — Index Interactif des 5 Domaines (`ServicesStage`)** :
   - Scène plein écran où chaque discipline (`01` Design graphique, `02` Production audiovisuelle, `03` Communication digitale, `04` Solutions numériques / TIC, `05` Création de sites web) possède sa **propre teinte d'ambiance** et son **visuel signature**.
   - Au survol ou à la sélection, l'ambiance chromatique de la scène bascule en douceur, le visuel se révèle par masque, et un tiroir fluide présente la valeur concrète + accès direct à la galerie filtrée.
5. **Scène 4 — Sélection de Projets : Double Mode *Galerie Pinned* & *Explorer* (`WorksShowcase`)** :
   - **Mode Galerie (défaut)** : filtres par catégorie avec transition fluide de réorganisation (**FLIP**) + sur desktop, **galerie horizontale *pinned* (`ScrollTrigger`)** avec vignettes révélées par masque, vue liste alternative à **traînée d'images flottante au survol**, et transition visuelle fluide vers la fiche projet.
   - **Mode « Explorer »** : **canevas spatial libre à glisser (drag-to-pan)** avec inertie, coordonnées X/Y en direct et cartes organiques façon table lumineuse de studio, utilisable à la souris comme au doigt sur mobile !
6. **Scène 5 — Fondateur & Maîtrise (`FounderStage`)** :
   - Composition asymétrique forte autour de **Joseph Kouamé**, du **monogramme JK interactif** et de la chaîne complète de savoir-faire (sans portrait ni biographie inventés).
7. **Scène 6 & 7 — Bandeau Cinétique, Contact & Pied de Page Spectaculaire (`Marquee`, `ContactStage`, `Footer`)** :
   - Bandeau typographique incliné/double sens à grande vitesse maîtrisée.
   - Espace Contact orienté conversion (formulaire Supabase + repli WhatsApp + raccourcis directs).
   - **Pied de page monumental** où le gigantesque wordmark **KAIROS STUDIO** réagit lettre par lettre au curseur (élévation magnétique, lueur chromatique, contraste de graisse).

---

## 4. Protocole d'expérimentation (Couleurs & Typographies)

### 3 Directions chromatiques à tester en réel sur la page d'accueil
Toutes construites en tokens CSS (`--bg-primary`, `--bg-elevated`, `--text-primary`, `--text-muted`, `--accent-1`, `--accent-2`, `--accent-3`, `--glow`, `--mesh-1..3`, `--border`) et commutables via `?palette=braise|indigo|encre` + un commutateur discret :
- **`braise`** : Presque-noir `#07070B` + dégradé incandescent `#FF6B00` → `#E6007E` → `#5B2EFF` + texte ivoire `#F6F1EA`.
- **`indigo`** : Nuit indigo profond `#0A0E27` + corail vif `#FF5A3C` + ambre `#FFB347` + ultramarine électrique `#3347FF` + texte crème `#FFF3E4`.
- **`encre`** : Papier chaud `#F3EEE6` + encre `#0F0F12` + vermillon éclatant `#E8392B` + vert-bleu profond `#0F4C4A`.

### 3 Duos typographiques auto-hébergés à tester
1. **Duo 1 — `Syne Variable` (display avant-gardiste à variations expressives) + `Space Grotesk` (corps technique fluide) + `JetBrains Mono` (repères/timecodes)**
2. **Duo 2 — `Bricolage Grotesque Variable` (grotesque singulière expressive) + `Plus Jakarta Sans` + `JetBrains Mono`**
3. **Duo 3 — `Fraunces Variable` (serif éditorial à fort contraste optique) + `Space Grotesk` + `JetBrains Mono`**

Chaque palette et chaque duo sera comparé visuellement puis tranché et justifié dans `DECISIONS.md`.
