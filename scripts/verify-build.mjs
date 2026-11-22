/**
 * Vérification automatisée du build 100 % statique
 * (SEO, routes, absence totale de Supabase et /admin, poids GitHub Pages, sécurité).
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function getPublishedProjects() {
  const source = await fs.readFile(path.join(ROOT, 'src', 'content', 'projects.ts'), 'utf8');
  const match = source.match(/export const PUBLISHED_PROJECTS:\s*Project\[\]\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) {
    throw new Error('Impossible de lire PUBLISHED_PROJECTS dans src/content/projects.ts');
  }
  return JSON.parse(match[1]);
}

async function main() {
  const projects = await getPublishedProjects();

  const required = [
    'index.html',
    '404.html',
    'sitemap.xml',
    'robots.txt',
    '.nojekyll',
    'fr/index.html',
    'en/index.html',
    'fr/mentions-legales/index.html',
    'en/legal-notice/index.html',
    'fr/confidentialite/index.html',
    'en/privacy/index.html',
    'media/images/affiche-apercu-fr-v1.jpg',
    'media/images/affiche-apercu-en-v1.jpg',
  ];

  for (const proj of projects) {
    required.push(`fr/projets/${proj.slug}/index.html`);
    required.push(`en/projects/${proj.slug}/index.html`);
    if (proj.cover_image_url) required.push(proj.cover_image_url);
    if (proj.video_url) required.push(proj.video_url);
  }

  let failed = false;

  for (const rel of required) {
    const p = path.join(DIST, rel);
    try {
      await fs.access(p);
    } catch {
      console.error(`[FAIL] Fichier manquant: dist/${rel}`);
      failed = true;
    }
  }

  // Vérifier que /admin n'existe PLUS du tout
  try {
    await fs.access(path.join(DIST, 'admin'));
    console.error('[FAIL] dist/admin existe encore alors que /admin doit être supprimé !');
    failed = true;
  } catch {
    // OK
  }

  const sitemap = await fs.readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
  if (sitemap.includes('/admin')) {
    console.error('[FAIL] sitemap.xml ne doit JAMAIS contenir /admin !');
    failed = true;
  }

  // Vérifier SEO, hreflang, JSON-LD et Open Graph FR/EN
  const ogChecks = [
    ['fr/index.html', 'affiche-apercu-fr-v1.jpg'],
    ['en/index.html', 'affiche-apercu-en-v1.jpg'],
  ];
  for (const [rel, ogFile] of ogChecks) {
    const content = await fs.readFile(path.join(DIST, rel), 'utf8');
    if (!content.includes('hreflang="fr"') || !content.includes('hreflang="en"')) {
      console.error(`[FAIL] hreflang manquant dans dist/${rel}`);
      failed = true;
    }
    if (!content.includes('application/ld+json')) {
      console.error(`[FAIL] JSON-LD manquant dans dist/${rel}`);
      failed = true;
    }
    if (!content.includes(ogFile) || !content.includes('summary_large_image')) {
      console.error(`[FAIL] Balises Open Graph / Twitter Card incorrectes dans dist/${rel}`);
      failed = true;
    }
  }

  // Vérifier limites GitHub Pages (< 100 Mo / fichier, < 1 Go total), absence totale de Supabase et secrets
  const allFiles = await walk(DIST);
  let totalBytes = 0;
  let largestFile = { path: '', bytes: 0 };

  for (const file of allFiles) {
    const stat = await fs.stat(file);
    totalBytes += stat.size;
    if (stat.size > largestFile.bytes) {
      largestFile = { path: path.relative(DIST, file), bytes: stat.size };
    }
    if (stat.size > 95 * 1024 * 1024) {
      console.error(`[FAIL] Fichier dépasse la limite GitHub Pages (100 Mo): ${file}`);
      failed = true;
    }
    if (/\.(html|js|css|json|xml|txt)$/i.test(file)) {
      const txt = await fs.readFile(file, 'utf8');
      if (/supabase/i.test(txt)) {
        console.error(`[FAIL] Référence Supabase détectée dans dist/${path.relative(DIST, file)} !`);
        failed = true;
      }
      if (/sbp_[a-zA-Z0-9]{20,}|service_role|ghp_[a-zA-Z0-9]{20,}/.test(txt)) {
        console.error(`[FAIL] Secret potentiel détecté dans ${file} !`);
        failed = true;
      }
    }
  }

  console.log(`[VERIFY] Projets publiés vérifiés: ${projects.length}`);
  console.log(`[VERIFY] Fichiers dans dist/: ${allFiles.length}`);
  console.log(`[VERIFY] Poids total dist/: ${(totalBytes / (1024 * 1024)).toFixed(2)} Mo (limite GitHub Pages: ~1000 Mo)`);
  console.log(
    `[VERIFY] Plus gros fichier: ${largestFile.path} (${(largestFile.bytes / (1024 * 1024)).toFixed(2)} Mo, limite: 100 Mo)`
  );

  if (failed) {
    process.exit(1);
  }
  console.log('[VERIFY] TOUS LES CONTRÔLES DE BUILD STATIQUE ONT RÉUSSI.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
