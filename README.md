# KAIROS STUDIO — Turning Ideas Into Experiences

Portfolio bilingue (FR / EN) 100 % statique de **Joseph Kouamé**, hébergé sur **GitHub Pages**.

## Architecture
- **Front-end** : React 19, TypeScript, Tailwind CSS v4, GSAP, Lenis, polices auto-hébergées (`Syne`, `Space Grotesk`, `Fraunces`, `JetBrains Mono`).
- **Contenu statique** : `src/content/projects.ts`, `src/content/media-manifest.json`, `src/content/media.ts`, médias optimisés WebP/AVIF & MP4 dans `public/media/`.
- **SEO & Prérendu** : `scripts/prerender.mjs` génère les routes HTML prérendues FR/EN, les balises Open Graph / Twitter Card, `sitemap.xml` et `404.html`.
- **Contact** : formulaire client direct ouvrant WhatsApp (`+225 07 89 50 17 05`) ou l’e-mail (`kuamejosephyakro452@gmail.com`) avec message pré-rempli, sans serveur ni base de données.

## Commandes
```bash
npm install
npm run dev          # Serveur local
npm run build        # Build + prérendu SEO statique
npm run test:smoke   # Vérification des routes, balises SEO et limites GitHub Pages
```

Pour ajouter, modifier ou supprimer un projet, consulter [GUIDE_MODIFICATION.md](./GUIDE_MODIFICATION.md).
