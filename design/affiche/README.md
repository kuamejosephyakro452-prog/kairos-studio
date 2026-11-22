# Affiche d'aperçu de partage — KAIROS STUDIO

- **Source modifiable** : `design/affiche/affiche-apercu.html` (HTML/CSS avec les polices exactes `@fontsource-variable` du site et le monogramme JK issu de `src/components/MonogramJK.tsx`).
- **Script d'export** : `design/affiche/render.mjs` (lit les créations originales en lecture seule, génère un master 2× `2400×1260` via Chrome Headless puis réduit en Lanczos3 sRGB vers `1200×630` JPG `< 300 Ko`).
- **Exports** : `design/affiche/exports/affiche-apercu-fr-v1.jpg` et `affiche-apercu-en-v1.jpg` (également copiés dans `public/media/images/`).

## Regénérer les aperçus
Depuis la racine du projet `kairos-studio/` :
```bash
node design/affiche/render.mjs
```
Pour forcer le rafraîchissement du cache WhatsApp / réseaux après une modification ultérieure, incrémenter le suffixe (`-v2.jpg`) dans `render.mjs`, `scripts/prerender.mjs` et `src/components/SeoHead.tsx`.
