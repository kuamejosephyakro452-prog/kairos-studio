import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const DESIGN_DIR = path.resolve(ROOT, 'design', 'affiche');
const EXPORTS_DIR = path.resolve(DESIGN_DIR, 'exports');
const QA_DIR = path.resolve(DESIGN_DIR, 'qa');
const PUBLIC_OG_DIR = path.resolve(ROOT, 'public', 'media', 'images');

fs.mkdirSync(EXPORTS_DIR, { recursive: true });
fs.mkdirSync(QA_DIR, { recursive: true });

// Lecture seule directe des fichiers originaux (aucune copie, aucune modification)
const ARTWORKS = {
  dc2026: {
    path: 'D:\\MON STUDIO\\05_EXPORTATIONS\\DIGITAL_CREATIVITY_2026\\DIGITAL_CREATIVITY_2026_INSTAGRAM_1080x1350.png',
    mime: 'image/png',
  },
  kiwi: {
    path: 'D:\\MON STUDIO\\05_EXPORTATIONS\\2026-11_COLLECTION_AFFICHES_KAIROS\\02_Affiche_Cosmetique_Kiwi_1x1.png',
    mime: 'image/png',
  },
  nexora: {
    path: path.resolve(ROOT, 'public', 'media', 'images', 'nexora-still-01-960w.webp'),
    mime: 'image/webp',
  },
};

const FONTS = {
  'syne-latin.woff2': path.resolve(ROOT, 'node_modules/@fontsource-variable/syne/files/syne-latin-wght-normal.woff2'),
  'syne-latin-ext.woff2': path.resolve(ROOT, 'node_modules/@fontsource-variable/syne/files/syne-latin-ext-wght-normal.woff2'),
  'space-grotesk-latin.woff2': path.resolve(ROOT, 'node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2'),
  'space-grotesk-latin-ext.woff2': path.resolve(ROOT, 'node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-ext-wght-normal.woff2'),
  'jetbrains-mono-latin.woff2': path.resolve(ROOT, 'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2'),
  'jetbrains-mono-latin-ext.woff2': path.resolve(ROOT, 'node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-ext-wght-normal.woff2'),
};

for (const [k, info] of Object.entries(ARTWORKS)) {
  if (!fs.existsSync(info.path)) {
    throw new Error(`Ressource introuvable (${k}): ${info.path}`);
  }
}
for (const [k, fp] of Object.entries(FONTS)) {
  if (!fs.existsSync(fp)) {
    throw new Error(`Police introuvable (${k}): ${fp}`);
  }
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url || '/', 'http://127.0.0.1');
  if (urlObj.pathname === '/' || urlObj.pathname === '/affiche-apercu.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(DESIGN_DIR, 'affiche-apercu.html')).pipe(res);
    return;
  }
  if (urlObj.pathname.startsWith('/fonts/')) {
    const key = urlObj.pathname.replace('/fonts/', '');
    if (FONTS[key]) {
      res.writeHead(200, { 'Content-Type': 'font/woff2' });
      fs.createReadStream(FONTS[key]).pipe(res);
      return;
    }
  }
  if (urlObj.pathname.startsWith('/art/')) {
    const key = urlObj.pathname.replace('/art/', '');
    if (ARTWORKS[key]) {
      res.writeHead(200, { 'Content-Type': ARTWORKS[key].mime });
      fs.createReadStream(ARTWORKS[key].path).pipe(res);
      return;
    }
  }
  res.writeHead(404);
  res.end('Not found');
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-chrome-'));

try {
  for (const lang of ['fr', 'en']) {
    const masterPng = path.join(QA_DIR, `master-2x-${lang}.png`);
    await execFileAsync(
      chrome,
      [
        '--headless=new',
        `--user-data-dir=${tmpProfile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=2',
        '--window-size=1200,630',
        `--screenshot=${masterPng}`,
        `http://127.0.0.1:${port}/affiche-apercu.html?lang=${lang}`,
      ],
      { timeout: 25000 }
    );

    const outName = `affiche-apercu-${lang}-v1.jpg`;
    const exportJpg = path.join(EXPORTS_DIR, outName);
    const publicJpg = path.join(PUBLIC_OG_DIR, outName);

    // Réduction Lanczos3 depuis master 2x (2400x1260) -> 1200x630 sRGB JPG optimisé (< 300 Ko)
    let quality = 86;
    let buf;
    while (quality >= 70) {
      buf = await sharp(masterPng)
        .resize(1200, 630, { kernel: sharp.kernel.lanczos3 })
        .toColorspace('srgb')
        .jpeg({ quality, progressive: true, mozjpeg: true, chromaSubsampling: '4:2:0' })
        .toBuffer();
      if (buf.length < 280 * 1024) break;
      quality -= 4;
    }

    fs.writeFileSync(exportJpg, buf);
    fs.writeFileSync(publicJpg, buf);

    // Miniature 300px pour contrôle visuel smartphone/WhatsApp
    const miniPng = path.join(QA_DIR, `mini-300w-${lang}.png`);
    await sharp(buf).resize(300, 158, { kernel: sharp.kernel.lanczos3 }).png().toFile(miniPng);

    const meta = await sharp(buf).metadata();
    console.log(
      `[OK] ${outName}: ${meta.width}x${meta.height} (${meta.space}), ${(buf.length / 1024).toFixed(1)} Ko (q=${quality})`
    );
  }
} finally {
  server.close();
  fs.rmSync(tmpProfile, { recursive: true, force: true });
}
