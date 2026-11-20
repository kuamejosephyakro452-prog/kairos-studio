/**
 * Traitement des images en LECTURE SEULE pour KAIROS STUDIO.
 * Génère pour chaque image retenue :
 *   - 3 largeurs responsives : 480w, 960w, 1600w
 *   - 2 formats modernes : .avif et .webp
 *   - 1 manifest JSON de dimensions réelles (src/data/media-manifest.json)
 * Ne modifie jamais aucun fichier original dans D:\MON STUDIO ou D:\MON_STUDIO_VIDEO.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'media', 'images');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'media-manifest.json');
const TMP_STILLS = path.join(ROOT, 'scripts', '.tmp-stills');

const ASSETS = [
  // Posters & stills vidéo
  {
    id: 'hero-showreel-poster',
    src: path.join(TMP_STILLS, 'hero-showreel-poster.png'),
    widths: [480, 960, 1600],
  },
  {
    id: 'pub-nexora-poster',
    src: path.join(TMP_STILLS, 'pub-nexora-poster.png'),
    widths: [480, 960, 1600],
  },
  {
    id: 'nexora-still-01',
    src: path.join(TMP_STILLS, 'nexora-still-01.png'),
    widths: [480, 960, 1600],
  },
  {
    id: 'nexora-still-02',
    src: path.join(TMP_STILLS, 'nexora-still-02.png'),
    widths: [480, 960, 1600],
  },
  {
    id: 'nexora-still-03',
    src: path.join(TMP_STILLS, 'nexora-still-03.png'),
    widths: [480, 960, 1600],
  },
  {
    id: 'nexora-still-04',
    src: path.join(TMP_STILLS, 'nexora-still-04.png'),
    widths: [480, 960, 1600],
  },

  // Projet 1 (Publié) : Pub Nexora Tech (packshot + logo sur fond obsidienne)
  {
    id: 'nexora-packshot',
    src: 'D:\\MON_STUDIO_VIDEO\\05_PROJETS_EN_COURS\\2026-11_PUB_NEXORA_TECH\\03_GRAPHIQUES\\NEXORA_Packshot_Final.png',
    widths: [480, 960, 1600],
  },
  {
    id: 'nexora-logo',
    src: 'D:\\MON_STUDIO_VIDEO\\05_PROJETS_EN_COURS\\2026-11_PUB_NEXORA_TECH\\03_GRAPHIQUES\\NEXORA_Logo_Master.png',
    widths: [480, 960, 1600],
    flattenBg: '#060A13',
  },

  // Projet 2 (Publié) : Digital Creativity 2026
  {
    id: 'dc2026-instagram',
    src: 'D:\\MON STUDIO\\05_EXPORTATIONS\\DIGITAL_CREATIVITY_2026\\DIGITAL_CREATIVITY_2026_INSTAGRAM_1080x1350.png',
    widths: [480, 960, 1080],
  },
  {
    id: 'dc2026-a3',
    src: 'D:\\MON STUDIO\\05_EXPORTATIONS\\DIGITAL_CREATIVITY_2026\\DIGITAL_CREATIVITY_2026_A3_300DPI.png',
    widths: [480, 960, 1600],
  },
  {
    id: 'dc2026-logo',
    src: 'D:\\MON STUDIO\\01_PROJETS\\DIGITAL_CREATIVITY_2026\\vector_logo_dc2026.png',
    widths: [480, 960, 1400],
    flattenBg: '#09091F',
  },

  // Projet 3 (Publié) : Soirée de Louange — Une Nuit dans Sa Présence
  {
    id: 'louange-carre',
    src: 'D:\\MON STUDIO\\03_PROJETS\\STATUT_WHATSAPP\\Affiche_Louange_1080x1080.png',
    widths: [480, 960, 1080],
  },
  {
    id: 'louange-whatsapp',
    src: 'D:\\MON STUDIO\\03_PROJETS\\STATUT_WHATSAPP\\Affiche_Louange_Statut_WhatsApp_1080x1920.png',
    widths: [480, 960, 1080],
  },

  // Brouillon Admin uniquement (non affiché sur le site public) : Soirée Talents & Quiz Biblique
  {
    id: 'draft-talents-quiz',
    src: 'c:\\Users\\DELL\\Documents\\antigravity\\silly-nobel\\Affiche_Soiree_Talents_Quiz_Biblique_A4.png',
    widths: [480, 960, 1400],
  },
];

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });

  const manifest = {};

  for (const asset of ASSETS) {
    try {
      await fs.access(asset.src);
    } catch {
      console.warn(`[WARN] Source introuvable, ignorée: ${asset.src}`);
      continue;
    }

    const baseSharp = sharp(asset.src);
    const meta = await baseSharp.metadata();
    const origW = meta.width || 1200;
    const origH = meta.height || 800;

    const validWidths = Array.from(
      new Set(asset.widths.map((w) => Math.min(w, origW)))
    ).sort((a, b) => a - b);

    const variants = [];

    for (const w of validWidths) {
      let pipeline = sharp(asset.src);
      if (asset.flattenBg) {
        pipeline = pipeline.flatten({ background: asset.flattenBg });
      }
      pipeline = pipeline.resize({ width: w, withoutEnlargement: true });

      const webpFile = `${asset.id}-${w}w.webp`;
      const avifFile = `${asset.id}-${w}w.avif`;

      await pipeline.clone().webp({ quality: 84, effort: 5 }).toFile(path.join(OUT_DIR, webpFile));
      await pipeline.clone().avif({ quality: 68, effort: 4 }).toFile(path.join(OUT_DIR, avifFile));

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

    console.log(`[IMG] ${asset.id} (${origW}x${origH}) -> ${validWidths.join('w, ')}w (WebP + AVIF)`);
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\nManifest écrit: ${MANIFEST_PATH}`);

  // Nettoyage du dossier temporaire de stills PNG
  await fs.rm(TMP_STILLS, { recursive: true, force: true });
  console.log('Stills temporaires nettoyés.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
