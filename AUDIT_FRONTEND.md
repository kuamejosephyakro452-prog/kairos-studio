# AUDIT FRONTEND — KAIROS STUDIO (Version V1 avant refonte)

Audit critique réalisé sur la version en ligne (`https://kuamejosephyakro452-prog.github.io/kairos-studio/`) à partir des captures de référence archivées dans `docs/avant-apres/` (`avant_01_home_desktop_1440.png`, `avant_02_project_desktop_1440.png`, `avant_03_home_mobile_390.png`).

---

## 1. Ce qui fonctionne et doit être conservé
- Architecture technique solide : React 19 + TypeScript + Vite 6 + prérendu statique + `404.html` SPA.
- Backend Supabase (`lpenmdantrekfhyehbyp`) opérationnel : Auth admin unique, `disable_signup: true`, RLS vérifiée 10/10, formulaire de contact persistant + repli WhatsApp, administration `/admin` protégée et `noindex`.
- Pipeline CI/CD GitHub Pages + `keep-supabase-alive.yml` fiables.
- Routage bilingue `/fr` et `/en` propre et mémorisé.

## 2. Diagnostic franc des faiblesses visuelles & UX (pourquoi la V1 ne rivalise pas encore avec Awwwards SOTD)

### A. Direction narrative erronée (à supprimer intégralement)
- La V1 reposait sur la signification grecque du mot « Kairos » (*« l'instant juste »*, *« En grec ancien, Kairos désigne le moment opportun… »*, *« Façonner l'instant »*). Cela doit être **entièrement supprimé** : « KAIROS » est un simple nom de marque sans portée narrative.

### B. Palette trop sage et attendue
- Le triptyque beige/ivoire + noir + or (`#F4EEE3`, `#0B0B0C`, `#B8913F`) évoque un cabinet ou une maison classique plutôt qu'un studio créatif et numérique contemporain capable d'impressionner des clients exigeants. Le rendu du Hero V1 paraît sombre et feutré, manquant d'énergie, de tension chromatique et d'émotion immédiate.

### C. Composition & sections encore proches d'un gabarit classique
- **Hero** : mise en page sage en bas à gauche avec deux boutons pilules standard ; le monogramme `JK` reste confiné en petite icône de navbar au lieu d'être un véritable objet signature interactif dans le Hero.
- **Manifeste** : simple citation statique suivie de 3 colonnes identiques (motif trop « template »).
- **Services** : accordéon propre mais sans immersion visuelle — le survol ne transforme ni l'ambiance chromatique ni la scène visuelle.
- **Galerie** : piste `overflow-x-auto` basique avec 3 cartes uniquement (2 disciplines vides), sans véritable défilement horizontal *pinned* (ScrollTrigger), sans traînée d'images, sans vue d'exploration libre, et sans transition cinématographique vers les études de cas.
- **Navigation** : barre horizontale classique au lieu d'une navigation minimaliste ouvrant un menu plein écran architectural à typographie géante.
- **Pied de page** : wordmark en filigrane statique sans réaction au curseur.
- **Page 404** : absente côté UX (redirection silencieuse vers `/fr`).

### D. Typographie dépendante de Google Fonts externes & pas assez singulière
- Polices chargées depuis Google Fonts (dépendance externe, non auto-hébergées) ; le duo `Cormorant Garamond + Manrope` est élégant mais trop convenu pour un studio numérique pluridisciplinaire.

### E. Conversion client perfectible
- L'accroche d'accueil ne dit pas assez frontalement *ce que fait le studio*, *pour qui* et *pourquoi travailler avec lui*.
- Le bouton WhatsApp n'est pas accessible en permanence durant la navigation.

---

## 3. Objectifs mesurables de la Phase 2 (Refonte totale)
1. **Zéro référence** à la signification du nom « Kairos ».
2. **Concept directeur fort** issu du métier : transformer une idée brute en expérience visuelle, audiovisuelle et interactive (*Turning Ideas Into Experiences.*).
3. **Palette vibrante testée et comparée en réel** (`Indigo & Corail` vs `Braise` vs `Encre & Vermillon`), avec sélecteur temporaire (`?palette=...`) pour permettre la comparaison directe en ligne.
4. **Polices auto-hébergées** de fort caractère, comparées en 3 duos avant sélection.
5. **Chorégraphie GSAP + ScrollTrigger + Lenis + WebGL/Shader GLSL** fluide à 60 fps, 100 % accessible (`prefers-reduced-motion`, AA) et orientée tactile sur mobile.
6. **Galerie enrichie** (créations vérifiées + meilleures pièces `origine_non_verifiee` recadrées avec soin + 3 vidéos démo libres `demo = true` avec suppression en 1 clic dans `/admin`), vue *Pinned Horizontal* + vue libre *Explorer*.
7. **3 cycles complets de revue visuelle** (captures → critique sévère → corrections) et preuves avant/après dans `docs/avant-apres/`.
