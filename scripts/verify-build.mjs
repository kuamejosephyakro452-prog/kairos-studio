/**
 * Vérification automatisée du build statique (SEO, routes, poids des fichiers, sécurité secrets).
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

async function main() {
  const required = [
    'index.html',
    '404.html',
    'sitemap.xml',
    'robots.txt',
    '.nojekyll',
    'fr/index.html',
    'en/index.html',
    'fr/projets/pub-nexora-tech/index.html',
    'en/projects/pub-nexora-tech/index.html',
    'fr/projets/digital-creativity-2026/index.html',
    'en/projects/digital-creativity-2026/index.html',
    'fr/projets/soiree-de-louange-une-nuit-dans-sa-presence/index.html',
    'en/projects/soiree-de-louange-une-nuit-dans-sa-presence/index.html',
    'fr/projets/brand-guidelines-identity-manual/index.html',
    'en/projects/brand-guidelines-identity-manual/index.html',
    'fr/projets/natur-branding-packaging/index.html',
    'en/projects/natur-branding-packaging/index.html',
    'fr/projets/solution-digitale-automatisation/index.html',
    'en/projects/solution-digitale-automatisation/index.html',
    'fr/projets/ecommerce-training-session-web/index.html',
    'en/projects/ecommerce-training-session-web/index.html',
    'fr/projets/campagne-visuelle-gourmet/index.html',
    'en/projects/campagne-visuelle-gourmet/index.html',
    'fr/projets/demo-video-architecture-lumiere/index.html',
    'en/projects/demo-video-architecture-lumiere/index.html',
    'fr/mentions-legales/index.html',
    'en/legal-notice/index.html',
    'fr/confidentialite/index.html',
    'en/privacy/index.html',
    'admin/index.html',
  ];

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

  // Vérifier que /admin a bien noindex et n'est PAS dans sitemap.xml
  const adminHtml = await fs.readFile(path.join(DIST, 'admin', 'index.html'), 'utf8');
  if (!adminHtml.includes('noindex')) {
    console.error('[FAIL] dist/admin/index.html ne contient pas noindex !');
    failed = true;
  }

  const sitemap = await fs.readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
  if (sitemap.includes('/admin')) {
    console.error('[FAIL] sitemap.xml ne doit JAMAIS contenir /admin !');
    failed = true;
  }

  // Vérifier que les pages publiques contiennent hreflang + JSON-LD + aucune mention provisoire
  for (const rel of ['fr/index.html', 'en/index.html']) {
    const content = await fs.readFile(path.join(DIST, rel), 'utf8');
    if (!content.includes('hreflang="fr"') || !content.includes('hreflang="en"')) {
      console.error(`[FAIL] hreflang manquant dans dist/${rel}`);
      failed = true;
    }
    if (!content.includes('application/ld+json')) {
      console.error(`[FAIL] JSON-LD manquant dans dist/${rel}`);
      failed = true;
    }
    if (/À VALIDER|A VALIDER|TODO|LOREM IPSUM|moment opportun|grec ancien/i.test(content)) {
      console.error(`[FAIL] Texte provisoire ou étymologie interdite détectée dans dist/${rel}`);
      failed = true;
    }
  }

  // Vérifier limites GitHub Pages (< 100 Mo / fichier, < 1 Go total) et absence de secrets
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
      if (/sbp_[a-zA-Z0-9]{20,}|service_role|ghp_[a-zA-Z0-9]{20,}/.test(txt)) {
        console.error(`[FAIL] Secret potentiel détecté dans ${file} !`);
        failed = true;
      }
    }
  }

  console.log(`[VERIFY] Fichiers dans dist/: ${allFiles.length}`);
  console.log(`[VERIFY] Poids total dist/: ${(totalBytes / (1024 * 1024)).toFixed(2)} Mo (limite GitHub Pages: ~1000 Mo)`);
  console.log(
    `[VERIFY] Plus gros fichier: ${largestFile.path} (${(largestFile.bytes / (1024 * 1024)).toFixed(2)} Mo, limite: 100 Mo)`
  );

  if (failed) {
    process.exit(1);
  }
  console.log('[VERIFY] TOUS LES CONTRÔLES DE BUILD ONT RÉUSSI.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
