import type { Project } from '../types/portfolio';

export function appendVersionParam(url: string | null | undefined, updatedAt?: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed || !updatedAt) return trimmed;
  // Cache-buster uniquement sur les médias distants (ex. Supabase Storage) pour éviter le cache navigateur
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/[?&]v=/.test(trimmed)) return trimmed;
  const stamp = Date.parse(updatedAt);
  if (!Number.isFinite(stamp)) return trimmed;
  const sep = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${sep}v=${stamp}`;
}

/**
 * Enrichit les projets publiés reçus depuis Supabase (source de vérité unique) :
 * - Conserve cover_asset_id / video_poster_asset_id locaux UNIQUEMENT si l'URL n'a pas été remplacée dans l'admin.
 * - Ajoute un cache-buster ?v=<updated_at> sur les URLs distantes (Supabase Storage) pour refléter immédiatement tout changement d'image.
 * - Ne réinjecte JAMAIS les projets absents de Supabase (un projet dépublié ou supprimé disparaît immédiatement).
 */
export function enrichRemoteProjectsWithLocalManifest(
  remoteProjects: Project[],
  snapshotProjects: Project[]
): Project[] {
  const snapshotBySlug = new Map(snapshotProjects.map((p) => [p.slug, p]));
  return remoteProjects
    .map((proj) => {
      const local = snapshotBySlug.get(proj.slug);
      const coverSameAsStatic = Boolean(
        local && local.cover_asset_id && proj.cover_image_url === local.cover_image_url
      );
      const posterSameAsStatic = Boolean(
        local &&
          local.video_poster_asset_id &&
          proj.video_poster_url &&
          proj.video_poster_url === local.video_poster_url
      );

      const versionedGallery = proj.gallery.map((item) => ({
        ...item,
        url: item.url ? appendVersionParam(item.url, proj.updated_at) : item.url,
        posterUrl: item.posterUrl
          ? appendVersionParam(item.posterUrl, proj.updated_at)
          : item.posterUrl,
      }));

      return {
        ...proj,
        cover_asset_id: coverSameAsStatic ? local!.cover_asset_id : null,
        cover_image_url: coverSameAsStatic
          ? proj.cover_image_url
          : appendVersionParam(proj.cover_image_url, proj.updated_at),
        video_poster_asset_id: posterSameAsStatic ? local!.video_poster_asset_id : null,
        video_poster_url: posterSameAsStatic
          ? proj.video_poster_url
          : proj.video_poster_url
            ? appendVersionParam(proj.video_poster_url, proj.updated_at)
            : null,
        gallery: versionedGallery,
      };
    })
    .sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      const tb = b.created_at ? Date.parse(b.created_at) : 0;
      const ta = a.created_at ? Date.parse(a.created_at) : 0;
      return tb - ta;
    });
}
