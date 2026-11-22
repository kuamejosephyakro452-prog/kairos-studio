# Guide de modification — KAIROS STUDIO (100 % statique)

Ce site est entièrement statique et hébergé sur **GitHub Pages** : aucune base de données, aucun serveur, aucun espace d’administration.

---

## 1. Où se trouvent le contenu et les médias

| Élément | Emplacement dans le dépôt |
| --- | --- |
| **Liste des projets (FR/EN, ordre, catégories)** | `src/content/projects.ts` |
| **Index des images responsives (WebP / AVIF)** | `src/content/media-manifest.json` |
| **Médias Hero (boucle vidéo)** | `src/content/media.ts` |
| **Images déployées** | `public/media/images/` |
| **Vidéos déployées** | `public/media/video/` |
| **Textes généraux du site (FR/EN)** | `src/i18n/translations.ts` |
| **Affiches d’aperçu de partage (FR/EN)** | `design/affiche/` → `public/media/images/affiche-apercu-{fr,en}-v1.jpg` |

### Opérations courantes
- **Ajouter un projet automatiquement** (optimise un dossier d’images en WebP/AVIF avec empreinte et crée l’entrée) :
  ```bash
  npm run add-project -- --dir "C:\chemin\vers\mes-images" --title-fr "Titre FR" --title-en "Title EN" --category graphic-design
  ```
  Catégories valides : `graphic-design`, `audiovisual`, `digital-communication`, `digital-solutions`, `web-creation`.
  Complétez ensuite les textes (`subtitle_fr/en`, `summary_fr/en`, `description_fr/en`, `deliverables_fr/en`) dans `src/content/projects.ts`.
- **Modifier un projet** : éditez directement son objet dans `src/content/projects.ts`.
- **Réordonner les projets** : changez la valeur de `sort_order` ou déplacez simplement l’objet dans le tableau `PUBLISHED_PROJECTS` de `src/content/projects.ts`.
- **Supprimer un projet** : retirez son objet de `src/content/projects.ts`, supprimez son entrée dans `src/content/media-manifest.json` ainsi que ses fichiers dans `public/media/images/` (et `public/media/video/` s’il a une vidéo).

---

## 2. Publier une modification (et revenir en arrière)

### Publier sur GitHub Pages (~1 à 2 minutes)
```bash
npm run build
npm run test:smoke
git add -A
git commit -m "feat(content): mise à jour du portfolio"
git push origin main
```
Le workflow `.github/workflows/deploy.yml` compile les pages statiques, génère le prérendu SEO (`sitemap.xml`, balises Open Graph) et déploie automatiquement sur GitHub Pages en **1 à 2 minutes**.

### Revenir en arrière en une commande
- **Annuler le dernier commit publié** :
  ```bash
  git revert HEAD && git push origin main
  ```
- **Revenir à l’état exact d’avant la migration statique** :
  ```bash
  git checkout avant-sans-supabase
  ```

---

## 3. Modèle de message prêt à copier pour Antigravity

> Ajoute ce projet à mon portfolio `kairos-studio` (sans modifier le design ni les autres pages) :
> - **Titre FR / EN** : [Titre FR] / [Titre EN]
> - **Catégorie** : [Design graphique / Production audiovisuelle / Communication digitale / Solutions numériques / TIC / Création de sites web]
> - **Position** : [en tête de liste / après tel projet]
> - **Description** : [quelques lignes sur ce qui a été réalisé, sans rien inventer]
> - **Fichiers sources (lecture seule)** : `[chemin du dossier ou des fichiers sur D:\MON STUDIO ou D:\MON_STUDIO_VIDEO]`
>
> Optimise les visuels en WebP/AVIF avec empreinte dans `public/media/images/`, mets à jour `src/content/projects.ts` et `src/content/media-manifest.json`, vérifie `npm run build` et `npm run test:smoke`, puis déploie sur GitHub Pages.
