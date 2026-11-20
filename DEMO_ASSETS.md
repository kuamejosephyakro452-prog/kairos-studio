# DEMO ASSETS — VIDÉOS DE DÉMONSTRATION TEMPORAIRES

> **IMPORTANT** : Les vidéos listées ci-dessous sont des **contenus de démonstration temporaires** libres de droits destinés uniquement à illustrer le rendu audiovisuel du portfolio en attendant vos propres films complémentaires.  
> Elles ne sont **pas** attribuées à KAIROS STUDIO ni à Joseph Kouamé, portent le marqueur **`demo = true`** en base Supabase, résident dans le dossier dédié **`public/media/demo/`**, et peuvent être **supprimées toutes en un clic** depuis l'espace d'administration (`/admin` → bouton *« Supprimer tout le contenu de démonstration »*).

---

## Inventaire des vidéos de démonstration

| Slug | Titre neutre (FR / EN) | Fichier source local (copié en lecture seule) | Plateforme & URL officielle | Licence vérifiée | Fichiers web compressés |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `demo-video-architecture-lumiere` | Vidéo de démonstration — Architecture & Lumière / Demo Video — Architecture & Light | `D:\MON_STUDIO_VIDEO\02_RESSOURCES_VIDEO\B_Roll\B_ROLL_Ville_Skyline_Coucher_Soleil_4K_30fps.mp4` | **Pexels** — https://www.pexels.com/video/modern-city-skyline-at-sunset-31663374/ | **Pexels License** (usage commercial gratuit, sans attribution obligatoire) | `public/media/demo/demo-skyline.mp4`, `demo-skyline.webm`, `public/media/images/demo-skyline-poster-*.webp/.avif` |
| `demo-video-studio-collaboration` | Vidéo de démonstration — Travail en Studio / Demo Video — Studio Workflow | `D:\MON_STUDIO_VIDEO\02_RESSOURCES_VIDEO\B_Roll\B_ROLL_Corporate_Bureau_Equipe_Travail_4K_25fps.mp4` | **Pexels** — https://www.pexels.com/video/men-and-women-busy-working-on-their-computers-3251737/ | **Pexels License** (usage commercial gratuit, sans attribution obligatoire) | `public/media/demo/demo-studio.mp4`, `demo-studio.webm`, `public/media/images/demo-studio-poster-*.webp/.avif` |
| `demo-video-mouvement-ralenti` | Vidéo de démonstration — Mouvement & Matière / Demo Video — Motion & Texture | `D:\MON_STUDIO_VIDEO\02_RESSOURCES_VIDEO\B_Roll\B_ROLL_Nature_Riviere_Ralenti_1080p_24fps.mp4` | **Pexels** — https://www.pexels.com/video/water-splash-in-rocky-river-3998659/ | **Pexels License** (usage commercial gratuit, sans attribution obligatoire) | `public/media/demo/demo-motion.mp4`, `demo-motion.webm`, `public/media/images/demo-motion-poster-*.webp/.avif` |

---

## Comment supprimer tout le contenu de démonstration en un clic
1. Connectez-vous sur `https://kuamejosephyakro452-prog.github.io/kairos-studio/admin/`.
2. Dans l'onglet **Projets**, cliquez sur le bouton rouge **« Supprimer tout le contenu de démonstration »**.
3. Confirmez : tous les projets marqués `demo = true` sont immédiatement supprimés de la base Supabase (et tous les éventuels fichiers du dossier `demo/` dans Supabase Storage sont purgés).
4. Pour retirer définitivement les fichiers statiques du dépôt Git si vous ne souhaitez plus les conserver dans l'instantané : supprimez le dossier `public/media/demo/` et relancez un déploiement.
