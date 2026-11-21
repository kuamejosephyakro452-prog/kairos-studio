/**
 * Traitement en LECTURE SEULE des 5 nouvelles affiches originales + poster du showreel 60s
 * pour publication sur KAIROS STUDIO.
 * Fusionne proprement dans src/data/media-manifest.json sans altérer les médias existants.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'media', 'images');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'media-manifest.json');

const ASSETS = [
  {
    id: 'col26-moisson',
    src: 'D:\\MON STUDIO\\05_EXPORTATIONS\\2026-11_COLLECTION_AFFICHES_KAIROS\\01_Affiche_Grande_Moisson_16x9.png',
    widths: [480, 960, 1600],
  },
  {
    id: 'col26-kiwi',
    src: 'D:\\MON STUDIO\\05_EXPORTATIONS\\2026-11_COLLECTION_AFFICHES_KAIROS\\02_Affiche_Cosmetique_Kiwi_1x1.png',
    widths: [480, 960, 1200],
  },
  {
    id: 'col26-agir-vert',
    src: 'D:\\MON STUDIO\\05_EXPORTATIONS\\2026-11_COLLECTION_AFFICHES_KAIROS\\03_Flyer_Agir_Vert_2x3.png',
    widths: [480, 960, 1200],
  },
  {
    id: 'col26-sans-sommeil',
    src: 'D:\\MON STUDIO\\05_EXPORTATIONS\\2026-11_COLLECTION_AFFICHES_KAIROS\\04_Pochette_Sans_Sommeil_1x1.png',
    widths: [480, 960, 1200],
  },
  {
    id: 'col26-cap-essentiel',
    src: 'D:\\MON STUDIO\\05_EXPORTATIONS\\2026-11_COLLECTION_AFFICHES_KAIROS\\05_Flyer_Cap_Essentiel_4x5.png',
    widths: [480, 960, 1200],
  },
  {
    id: 'col26-showreel-poster',
    src: 'D:\\MON_STUDIO_VIDEO\\05_PROJETS_EN_COURS\\2026-11_SHOWREEL_AFFICHES_KAIROS\\03_GRAPHIQUES\\scene_06_outro.png',
    widths: [480, 960, 1280],
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
    await fs.access(asset.src);
    const buf = await sharp(asset.src).toBuffer();
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
      await pipe.clone().webp({ quality: 86, effort: 5 }).toFile(path.join(OUT_DIR, webpFile));
      await pipe.clone().avif({ quality: 70, effort: 4 }).toFile(path.join(OUT_DIR, avifFile));

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
    console.log(`[IMG COL26] ${asset.id} (${origW}x${origH}) -> ${validWidths.join('w, ')}w`);
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Collection 2026 images + media-manifest.json updated cleanly.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
