import manifestRaw from '@/content/media-manifest.json';
import type { MediaManifestEntry } from '@/types/portfolio';

const manifest = manifestRaw as Record<string, MediaManifestEntry>;

/**
 * Résout un chemin d'asset relatif au basePath Vite (compatible GitHub Pages et domaine personnalisé)
 * tout en laissant intactes les URLs absolues.
 */
export function resolveAssetUrl(pathOrUrl: string | null | undefined): string {
  if (!pathOrUrl) return '';
  if (/^(https?:)?\/\//i.test(pathOrUrl) || pathOrUrl.startsWith('data:') || pathOrUrl.startsWith('blob:')) {
    return pathOrUrl;
  }
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const clean = pathOrUrl.replace(/^\/+/, '');
  return `${base}/${clean}`;
}

export function getMediaEntry(assetId?: string | null): MediaManifestEntry | null {
  if (!assetId) return null;
  return manifest[assetId] || null;
}

export function buildSrcSet(entry: MediaManifestEntry, format: 'avif' | 'webp'): string {
  return entry.variants.map((v) => `${resolveAssetUrl(v[format])} ${v.width}w`).join(', ');
}

export function getLargestWebp(entry: MediaManifestEntry): string {
  const last = entry.variants[entry.variants.length - 1];
  return resolveAssetUrl(last.webp);
}
