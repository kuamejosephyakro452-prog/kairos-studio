/**
 * Prérendu statique SEO + sitemap.xml + 404.html SPA pour GitHub Pages.
 * Exécuté automatiquement après `vite build`.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const SITE_URL = (
  process.env.VITE_SITE_URL || 'https://kuamejosephyakro452-prog.github.io/kairos-studio'
).replace(/\/+$/, '');
const BASE_PATH = (process.env.VITE_BASE_PATH || '/kairos-studio/').replace(/\/+$/, '') + '/';

// Lecture directe du catalogue statique officiel dans src/content/projects.ts
async function getPublishedProjectsMeta() {
  const source = await fs.readFile(path.join(ROOT, 'src', 'content', 'projects.ts'), 'utf8');
  const match = source.match(/export const PUBLISHED_PROJECTS:\s*Project\[\]\s*=\s*(\[[\s\S]*?\n\]);/);
  if (!match) {
    throw new Error('Impossible de lire PUBLISHED_PROJECTS dans src/content/projects.ts');
  }
  const parsed = JSON.parse(match[1]);
  return parsed.filter((p) => p.status === 'published');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml(template, route) {
  let html = template;
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${route.lang}"`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`
  );

  // Remplacer href="./favicon.svg" par un chemin absolu dans BASE_PATH pour les routes profondes
  html = html.replace(/href="\.\/favicon\.svg"/g, `href="${BASE_PATH}favicon.svg"`);

  const canonicalUrl = `${SITE_URL}${route.path}`;
  const isEn = route.lang === 'en';
  const defaultOgImage = `${SITE_URL}/media/images/${isEn ? 'affiche-apercu-en-v1.jpg' : 'affiche-apercu-fr-v1.jpg'}`;
  const defaultOgAlt = isEn
    ? 'KAIROS STUDIO — Turning Ideas Into Experiences. Creative & digital studio: Graphic Design, Audiovisual Production, Digital Communication, Digital Solutions / ICT, Web Creation.'
    : 'KAIROS STUDIO — Turning Ideas Into Experiences. Studio créatif et numérique : Design graphique, Production audiovisuelle, Communication digitale, Solutions numériques / TIC, Création de sites web.';
  const ogImage = route.ogImage || defaultOgImage;
  const isDefaultOg = ogImage === defaultOgImage;
  const ogAlt = route.ogAlt || defaultOgAlt;

  const headInject = [
    `<meta name="robots" content="${route.noindex ? 'noindex, nofollow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    route.altFr ? `<link rel="alternate" hreflang="fr" href="${escapeHtml(`${SITE_URL}${route.altFr}`)}" />` : '',
    route.altEn ? `<link rel="alternate" hreflang="en" href="${escapeHtml(`${SITE_URL}${route.altEn}`)}" />` : '',
    route.altFr ? `<link rel="alternate" hreflang="x-default" href="${escapeHtml(`${SITE_URL}${route.altFr}`)}" />` : '',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="KAIROS STUDIO" />`,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />`,
    isDefaultOg ? `<meta property="og:image:type" content="image/jpeg" />` : '',
    isDefaultOg ? `<meta property="og:image:width" content="1200" />` : '',
    isDefaultOg ? `<meta property="og:image:height" content="630" />` : '',
    `<meta property="og:image:alt" content="${escapeHtml(ogAlt)}" />`,
    `<meta property="og:locale" content="${route.lang === 'fr' ? 'fr_FR' : 'en_US'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(ogAlt)}" />`,
    route.jsonLd
      ? `<script id="kairos-jsonld" type="application/ld+json">${JSON.stringify(route.jsonLd)}</script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  html = html.replace('</head>', `    ${headInject}\n  </head>`);

  if (route.noscriptHtml) {
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root"></div>\n    <noscript>${route.noscriptHtml}</noscript>`
    );
  }

  return html;
}

async function writeRouteHtml(relPath, html) {
  const clean = relPath.replace(/^\/+|\/+$/g, '');
  const targetDir = clean ? path.join(DIST, clean) : DIST;
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(path.join(targetDir, 'index.html'), html, 'utf8');
}

async function main() {
  const baseTemplate = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');
  const projects = await getPublishedProjectsMeta();

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KAIROS STUDIO',
    slogan: 'Turning Ideas Into Experiences.',
    url: `${SITE_URL}/fr`,
    email: 'kuamejosephyakro452@gmail.com',
    telephone: '+2250789501705',
    founder: {
      '@type': 'Person',
      name: 'Joseph Kouamé',
      jobTitle: 'Fondateur & Directeur créatif',
    },
  };

  const routes = [
    {
      path: '/fr',
      lang: 'fr',
      title: 'KAIROS STUDIO — Turning Ideas Into Experiences | Joseph Kouamé',
      description:
        'Studio créatif et numérique polyvalent fondé par Joseph Kouamé : design graphique, production audiovisuelle, communication digitale, solutions numériques / TIC et création de sites web.',
      altFr: '/fr',
      altEn: '/en',
      jsonLd: orgJsonLd,
      noscriptHtml:
        '<main><h1>KAIROS STUDIO — Turning Ideas Into Experiences</h1><p>Joseph Kouamé, Fondateur & Directeur créatif. Design graphique, Production audiovisuelle, Communication digitale, Solutions numériques / TIC, Création de sites web.</p></main>',
    },
    {
      path: '/en',
      lang: 'en',
      title: 'KAIROS STUDIO — Turning Ideas Into Experiences | Joseph Kouamé',
      description:
        'Multidisciplinary creative and digital studio founded by Joseph Kouamé: graphic design, audiovisual production, digital communication, ICT solutions, and web creation.',
      altFr: '/fr',
      altEn: '/en',
      jsonLd: orgJsonLd,
      noscriptHtml:
        '<main><h1>KAIROS STUDIO — Turning Ideas Into Experiences</h1><p>Joseph Kouamé, Founder & Creative Director. Graphic Design, Audiovisual Production, Digital Communication, Digital Solutions / ICT, Web Creation.</p></main>',
    },
    {
      path: '/fr/mentions-legales',
      lang: 'fr',
      title: 'Mentions légales — KAIROS STUDIO',
      description: 'Mentions légales du portfolio officiel KAIROS STUDIO, fondé par Joseph Kouamé.',
      altFr: '/fr/mentions-legales',
      altEn: '/en/legal-notice',
    },
    {
      path: '/en/legal-notice',
      lang: 'en',
      title: 'Legal Notice — KAIROS STUDIO',
      description: 'Legal notice for the official KAIROS STUDIO portfolio founded by Joseph Kouamé.',
      altFr: '/fr/mentions-legales',
      altEn: '/en/legal-notice',
    },
    {
      path: '/fr/confidentialite',
      lang: 'fr',
      title: 'Politique de confidentialité — KAIROS STUDIO',
      description: 'Politique de confidentialité de KAIROS STUDIO.',
      altFr: '/fr/confidentialite',
      altEn: '/en/privacy',
    },
    {
      path: '/en/privacy',
      lang: 'en',
      title: 'Privacy Policy — KAIROS STUDIO',
      description: 'Privacy policy of KAIROS STUDIO.',
      altFr: '/fr/confidentialite',
      altEn: '/en/privacy',
    },
  ];

  for (const proj of projects) {
    const ogImg = proj.cover_image_url.startsWith('http')
      ? proj.cover_image_url
      : `${SITE_URL}/${proj.cover_image_url.replace(/^\/+/, '')}`;

    routes.push({
      path: `/fr/projets/${proj.slug}`,
      lang: 'fr',
      title: `${proj.title_fr} — KAIROS STUDIO`,
      description: proj.subtitle_fr,
      altFr: `/fr/projets/${proj.slug}`,
      altEn: `/en/projects/${proj.slug}`,
      ogImage: ogImg,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: proj.title_fr,
        description: proj.subtitle_fr,
        creator: { '@type': 'Organization', name: 'KAIROS STUDIO' },
      },
    });
    routes.push({
      path: `/en/projects/${proj.slug}`,
      lang: 'en',
      title: `${proj.title_en} — KAIROS STUDIO`,
      description: proj.subtitle_en,
      altFr: `/fr/projets/${proj.slug}`,
      altEn: `/en/projects/${proj.slug}`,
      ogImage: ogImg,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: proj.title_en,
        description: proj.subtitle_en,
        creator: { '@type': 'Organization', name: 'KAIROS STUDIO' },
      },
    });
  }

  // Générer toutes les pages publiques prérendues
  for (const r of routes) {
    await writeRouteHtml(r.path, buildHtml(baseTemplate, r));
  }

  // Racine `/` : conserve l'app SPA + balises SEO pointant vers /fr (redirection React immédiate vers /fr)
  const rootHtml = buildHtml(baseTemplate, {
    path: '/fr',
    lang: 'fr',
    title: 'KAIROS STUDIO — Turning Ideas Into Experiences | Joseph Kouamé',
    description:
      'Studio créatif et numérique polyvalent fondé par Joseph Kouamé : design graphique, production audiovisuelle, communication digitale, solutions numériques / TIC et création de sites web.',
    altFr: '/fr',
    altEn: '/en',
    jsonLd: orgJsonLd,
  });
  await writeRouteHtml('/', rootHtml);

  // 404.html de secours pour GitHub Pages (rechargement profond de toute route SPA)
  const fallback404 = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>KAIROS STUDIO</title>
    <meta name="robots" content="noindex" />
    <script>
      (function () {
        try {
          sessionStorage.setItem('kairos-gh-redirect', location.pathname + location.search + location.hash);
        } catch (e) {}
        location.replace('${BASE_PATH}');
      })();
    </script>
  </head>
  <body style="background:#0B0B0C;color:#F4EEE3;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
    <p>Redirection vers KAIROS STUDIO...</p>
  </body>
</html>
`;
  await fs.writeFile(path.join(DIST, '404.html'), fallback404, 'utf8');

  // sitemap.xml (uniquement routes publiques)
  const today = new Date().toISOString().split('T')[0];
  const urlEntries = routes
    .map((r) => {
      const links = [];
      if (r.altFr) {
        links.push(`    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}${r.altFr}" />`);
        links.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${r.altFr}" />`);
      }
      if (r.altEn) {
        links.push(`    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${r.altEn}" />`);
      }
      const priority = r.path === '/fr' || r.path === '/en' ? '1.0' : r.path.includes('proj') ? '0.8' : '0.4';
      return [
        '  <url>',
        `    <loc>${SITE_URL}${r.path}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <priority>${priority}</priority>`,
        ...links,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>
`;
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemapXml, 'utf8');

  // .nojekyll pour GitHub Pages
  await fs.writeFile(path.join(DIST, '.nojekyll'), '', 'utf8');

  console.log(`[PRERENDER] ${routes.length} routes publiques + 404.html + sitemap.xml générés.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
