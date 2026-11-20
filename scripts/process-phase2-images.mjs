/**
 * Traitement Phase 2 en LECTURE SEULE :
 * - Recadrage chirurgical des meilleures pièces de 04_TEMPLATES / MES MODELS (zéro bordure template)
 * - Posters des 3 vidéos de démonstration temporaires
 * - Fusion propre dans src/data/media-manifest.json (conserve les assets Phase 1)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'media', 'images');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'media-manifest.json');
const TMP_STILLS = path.join(ROOT, 'scripts', '.tmp-stills');

const ASSETS = [
  // Posters vidéos démo
  { id: 'demo-skyline-poster', src: path.join(TMP_STILLS, 'demo-skyline-poster.png'), widths: [480, 960, 1600] },
  { id: 'demo-studio-poster', src: path.join(TMP_STILLS, 'demo-studio-poster.png'), widths: [480, 960, 1600] },
  { id: 'demo-motion-poster', src: path.join(TMP_STILLS, 'demo-motion-poster.png'), widths: [480, 960, 1600] },

  // Brand Guidelines — 3 planches découpées proprement
  {
    id: 'tpl-brand-guidelines-1',
    src: 'D:\\MON STUDIO\\02_RESSOURCES\\MES MODELS\\Looking for a brand guidelines template to speed….png',
    extract: { left: 192, top: 188, width: 816, height: 458 },
    widths: [480, 816],
  },
  {
    id: 'tpl-brand-guidelines-2',
    src: 'D:\\MON STUDIO\\02_RESSOURCES\\MES MODELS\\Looking for a brand guidelines template to speed….png',
    extract: { left: 192, top: 668, width: 816, height: 458 },
    widths: [480, 816],
  },
  {
    id: 'tpl-brand-guidelines-3',
    src: 'D:\\MON STUDIO\\02_RESSOURCES\\MES MODELS\\Looking for a brand guidelines template to speed….png',
    extract: { left: 192, top: 1148, width: 816, height: 458 },
    widths: [480, 816],
  },

  // Natur Branding Packaging — 3 déclinaisons chromatiques vibrantes (sans barre blanche)
  {
    id: 'tpl-natur-1',
    src: 'D:\\MON STUDIO\\02_RESSOURCES\\MES MODELS\\NATUR I BRANDING DESIGN.png',
    extract: { left: 0, top: 252, width: 1400, height: 936 },
    widths: [480, 960, 1400],
  },
  {
    id: 'tpl-natur-2',
    src: 'D:\\MON STUDIO\\02_RESSOURCES\\MES MODELS\\NATUR I BRANDING DESIGN.png',
    extract: { left: 0, top: 1190, width: 1400, height: 936 },
    widths: [480, 960, 1400],
  },
  {
    id: 'tpl-natur-3',
    src: 'D:\\MON STUDIO\\02_RESSOURCES\\MES MODELS\\NATUR I BRANDING DESIGN.png',
    extract: { left: 0, top: 2128, width: 1400, height: 936 },
    widths: [480, 960, 1400],
  },

  // Solution Globale & Automatisation (plein cadre)
  {
    id: 'tpl-solution-global',
    src: 'D:\\MON STUDIO\\02_RESSOURCES\\MES MODELS\\SOMEONE SOMEWHERE NEEDS YOUR SOLUTION.png',
    widths: [480, 960, 1500],
  },

  // E-Commerce Training Session (carré central sans marge template)
  {
    id: 'tpl-ecommerce-session',
    src: 'D:\\MON STUDIO\\04_TEMPLATES\\online-ecommerce-training-session-social-media-post-template_292.jpg',
    extract: { left: 262, top: 218, width: 1564, height: 1564 },
    widths: [480, 960, 1400],
  },

  // Gourmet Food Campaign (carré central incandescent sans barre basse)
  {
    id: 'tpl-gourmet-campaign',
    src: 'D:\\MON STUDIO\\04_TEMPLATES\\Delicious_burger_and_fast_food_restaurant_menu_social_media_promotional_flyer_banner_template_Free_Psd.jpg',
    extract: { left: 256, top: 256, width: 1488, height: 1488 },
    widths: [480, 960, 1400],
  },

  // Audio Product Campaign (carré noir & jaune sans mention template)
  {
    id: 'tpl-audio-product',
    src: 'D:\\MON STUDIO\\02_RESSOURCES\\MES MODELS\\Square Sale Banner Template With Earphones.jpg',
    extract: { left: 90, top: 90, width: 446, height: 446 },
    widths: [446],
  },
];

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  let manifest = {};
  try {
    manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
  } catch {
    manifest = {};
  }

  for (const asset of ASSETS) {
    try {
      await fs.access(asset.src);
    } catch {
      console.warn(`[WARN] Source introuvable: ${asset.src}`);
      continue;
    }

    let base = sharp(asset.src);
    if (asset.extract) {
      base = base.extract(asset.extract);
    }
    const buf = await base.toBuffer();
    const meta = await sharp(buf).metadata();
    const origW = meta.width || 1200;
    const origH = meta.height || 800;

    const validWidths = Array.from(
      new Set(asset.widths.map((w) => Math.min(w, origW)))
    ).sort((a, b) => a - b);

    const variants = [];
    for (const w of validWidths) {
      const pipe = sharp(buf).resize({ width: w, withoutEnlargement: true });
      const webpFile = `${asset.id}-${w}w.webp`;
      const avifFile = `${asset.id}-${w}w.avif`;
      await pipe.clone().webp({ quality: 84, effort: 5 }).toFile(path.join(OUT_DIR, webpFile));
      await pipe.clone().avif({ quality: 68, effort: 4 }).toFile(path.join(OUT_DIR, avifFile));

      const h = Math.round((origH / origW) * w);
      variants.push({
        width: w,
        height: h,
        webp: `media/images/${webpFile}`,
        avif: `media/images/${avifFile}`,
      });
    }

    manifest[asset.id] = {
      width: origW,
      height: origH,
      aspectRatio: Number((origW / origH).toFixed(4)),
      variants,
    };
    console.log(`[IMG P2] ${asset.id} (${origW}x${origH}) -> ${validWidths.join('w, ')}w`);
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  await fs.rm(TMP_STILLS, { recursive: true, force: true });
  console.log('Phase 2 images + manifest updated cleanly.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
