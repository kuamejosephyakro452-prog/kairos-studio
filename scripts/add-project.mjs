/**
 * Utilitaire rapide pour ajouter un projet au catalogue statique :
 *   npm run add-project -- --dir "C:\chemin\dossier-images" --slug "mon-projet" --category "graphic-design" --title-fr "Mon Projet" --title-en "My Project"
 *
 * Optimise chaque image du dossier en WebP + AVIF (480w, 960w, 1400w max) avec empreinte SHA-256
 * dans public/media/images/, met à jour src/content/media-manifest.json et ajoute le projet dans src/content/projects.ts.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const ROOT = process.cwd();
const VALID_CATEGORIES = [
  'graphic-design',
  'audiovisual',
  'digital-communication',
  'digital-solutions',
  'web-creation',
];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      out[key] = val;
    }
  }
  return out;
}

function slugify(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function processImage(srcFile, assetId, outDir) {
  const meta = await sharp(srcFile).metadata();
  const origW = meta.width || 1200;
  const origH = meta.height || 1200;
  const targetWidths = [480, 960, Math.min(origW, 1400)].filter((w, i, arr) => w <= origW && arr.indexOf(w) === i);
  if (targetWidths.length === 0) targetWidths.push(origW);

  const variants = [];
  for (const w of targetWidths) {
    const h = Math.round((w * origH) / origW);
    const webpBuf = await sharp(srcFile).resize(w).webp({ quality: 84 }).toBuffer();
    const avifBuf = await sharp(srcFile).resize(w).avif({ quality: 62 }).toBuffer();

    const webpHash = crypto.createHash('sha256').update(webpBuf).digest('hex').slice(0, 8);
    const avifHash = crypto.createHash('sha256').update(avifBuf).digest('hex').slice(0, 8);

    const webpName = `${assetId}-${w}w-${webpHash}.webp`;
    const avifName = `${assetId}-${w}w-${avifHash}.avif`;

    fs.writeFileSync(path.join(outDir, webpName), webpBuf);
    fs.writeFileSync(path.join(outDir, avifName), avifBuf);

    variants.push({
      width: w,
      height: h,
      webp: `media/images/${webpName}`,
      avif: `media/images/${avifName}`,
    });
  }

  return {
    width: origW,
    height: origH,
    aspectRatio: Number((origW / origH).toFixed(4)),
    variants,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dir || !args['title-fr']) {
    console.log(
      'Usage: npm run add-project -- --dir "<dossier_images>" --title-fr "<Titre FR>" [--title-en "<Title EN>"] [--slug "<slug>"] [--category graphic-design|audiovisual|digital-communication|digital-solutions|web-creation]'
    );
    process.exit(1);
  }

  const srcDir = path.resolve(args.dir);
  if (!fs.existsSync(srcDir)) {
    throw new Error(`Dossier introuvable : ${srcDir}`);
  }

  const titleFr = args['title-fr'].trim();
  const titleEn = (args['title-en'] || titleFr).trim();
  const slug = slugify(args.slug || titleFr);
  const category = VALID_CATEGORIES.includes(args.category) ? args.category : 'graphic-design';

  const imgFiles = fs
    .readdirSync(srcDir)
    .filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f))
    .sort()
    .map((f) => path.join(srcDir, f));

  if (imgFiles.length === 0) {
    throw new Error(`Aucune image (.png, .jpg, .webp, .avif) trouvée dans ${srcDir}`);
  }

  const manifestPath = path.join(ROOT, 'src', 'content', 'media-manifest.json');
  const projectsPath = path.join(ROOT, 'src', 'content', 'projects.ts');
  const outImgDir = path.join(ROOT, 'public', 'media', 'images');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const projectsSrc = fs.readFileSync(projectsPath, 'utf8');
  const match = projectsSrc.match(/export const PUBLISHED_PROJECTS:\s*Project\[\]\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Format inattendu dans src/content/projects.ts');
  const projects = JSON.parse(match[1]);

  if (projects.some((p) => p.slug === slug)) {
    throw new Error(`Un projet avec le slug "${slug}" existe déjà.`);
  }

  const gallery = [];
  let coverAssetId = '';
  let coverUrl = '';
  let coverAspect = '1/1';

  for (let i = 0; i < imgFiles.length; i++) {
    const assetId = i === 0 ? `${slug}-cover` : `${slug}-${String(i + 1).padStart(2, '0')}`;
    const entry = await processImage(imgFiles[i], assetId, outImgDir);
    manifest[assetId] = entry;

    const ratio = entry.aspectRatio;
    const aspect = ratio >= 1.5 ? '16/9' : ratio <= 0.65 ? '9/16' : ratio < 0.9 ? '4/5' : '1/1';
    if (i === 0) {
      coverAssetId = assetId;
      coverUrl = entry.variants[entry.variants.length - 1].webp;
      coverAspect = aspect;
    }
    gallery.push({
      id: `${slug}-img-${i + 1}`,
      type: 'image',
      assetId,
      alt_fr: `${titleFr} — visuel ${i + 1}`,
      alt_en: `${titleEn} — visual ${i + 1}`,
      aspect,
    });
  }

  const newProject = {
    id: crypto.randomUUID(),
    slug,
    category,
    status: 'published',
    featured: true,
    sort_order: 1,
    origine_non_verifiee: false,
    demo: false,
    title_fr: titleFr,
    title_en: titleEn,
    subtitle_fr: args['subtitle-fr'] || 'Création originale KAIROS STUDIO',
    subtitle_en: args['subtitle-en'] || 'Original KAIROS STUDIO creation',
    summary_fr: args['summary-fr'] || 'Présentation du projet à compléter dans src/content/projects.ts.',
    summary_en: args['summary-en'] || 'Project summary to complete in src/content/projects.ts.',
    description_fr: args['description-fr'] || 'Description complète du projet à compléter dans src/content/projects.ts.',
    description_en: args['description-en'] || 'Full project description to complete in src/content/projects.ts.',
    client_name: null,
    project_year: null,
    role_fr: null,
    role_en: null,
    deliverables_fr: ['Création visuelle HD'],
    deliverables_en: ['High-resolution visual asset'],
    external_url: null,
    cover_asset_id: coverAssetId,
    cover_image_url: coverUrl,
    cover_image_alt_fr: titleFr,
    cover_image_alt_en: titleEn,
    cover_aspect: coverAspect,
    video_url: null,
    video_webm_url: null,
    video_poster_asset_id: null,
    video_poster_url: null,
    gallery,
  };

  projects.unshift(newProject);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  const nextProjectsSrc = projectsSrc.replace(
    /export const PUBLISHED_PROJECTS:\s*Project\[\]\s*=\s*\[[\s\S]*?\n\];/,
    `export const PUBLISHED_PROJECTS: Project[] = ${JSON.stringify(projects, null, 2)};`
  );
  fs.writeFileSync(projectsPath, nextProjectsSrc, 'utf8');

  console.log(`[OK] Projet "${slug}" ajouté (${imgFiles.length} image(s) optimisée(s) en WebP/AVIF).`);
  console.log('Pensez à relire les textes FR/EN dans src/content/projects.ts puis lancer : npm run build && npm run test:smoke');
}

main().catch((err) => {
  console.error('[ERREUR]', err.message);
  process.exit(1);
});
