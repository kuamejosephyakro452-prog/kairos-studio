export type Locale = 'fr' | 'en';

export type FontPairId = 'syne' | 'bricolage' | 'fraunces';

export type ProjectCategory =
  | 'graphic-design'
  | 'audiovisual'
  | 'digital-communication'
  | 'digital-solutions'
  | 'web-creation';

export type ProjectStatus = 'published' | 'draft';

export type CoverAspect = '16/9' | '4/5' | '1/1' | '9/16' | '3/4';

export interface MediaVariant {
  width: number;
  height: number;
  webp: string;
  avif: string;
}

export interface MediaManifestEntry {
  width: number;
  height: number;
  aspectRatio: number;
  variants: MediaVariant[];
}

export interface ProjectGalleryItem {
  id: string;
  type: 'image' | 'video';
  assetId?: string;
  url?: string;
  webmUrl?: string;
  posterAssetId?: string;
  posterUrl?: string;
  alt_fr: string;
  alt_en: string;
  caption_fr?: string;
  caption_en?: string;
  aspect?: CoverAspect;
}

export interface Project {
  id: string;
  slug: string;
  category: ProjectCategory;
  status: ProjectStatus;
  featured: boolean;
  sort_order: number;

  /** Marqueurs de gestion Phase 2 */
  origine_non_verifiee?: boolean;
  demo?: boolean;

  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  summary_fr: string;
  summary_en: string;
  description_fr: string;
  description_en: string;

  /** Champs optionnels : toujours vides si non renseignés (jamais inventés) */
  client_name?: string | null;
  project_year?: string | null;
  role_fr?: string | null;
  role_en?: string | null;
  deliverables_fr: string[];
  deliverables_en: string[];
  external_url?: string | null;

  cover_asset_id?: string | null;
  cover_image_url: string;
  cover_image_alt_fr: string;
  cover_image_alt_en: string;
  cover_aspect: CoverAspect;

  video_url?: string | null;
  video_webm_url?: string | null;
  video_poster_asset_id?: string | null;
  video_poster_url?: string | null;

  gallery: ProjectGalleryItem[];

  created_at?: string;
  updated_at?: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  message: string;
  locale: Locale;
  is_read: boolean;
  created_at: string;
}

export const ALL_CATEGORIES: ProjectCategory[] = [
  'graphic-design',
  'audiovisual',
  'digital-communication',
  'digital-solutions',
  'web-creation',
];
