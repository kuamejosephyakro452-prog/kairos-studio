import { PUBLISHED_PROJECTS_SNAPSHOT } from '@/data/projects.snapshot';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { ContactMessage, Locale, Project } from '@/types/portfolio';

export interface ContactPayload {
  full_name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  locale: Locale;
}

function normalizeRow(row: Record<string, unknown>): Project {
  const gallery = Array.isArray(row.gallery) ? row.gallery : [];
  return {
    id: String(row.id),
    slug: String(row.slug),
    category: row.category as Project['category'],
    status: (row.status as Project['status']) || 'draft',
    featured: Boolean(row.featured),
    sort_order: Number(row.sort_order ?? 0),
    origine_non_verifiee: Boolean(row.origine_non_verifiee),
    demo: Boolean(row.demo),
    title_fr: String(row.title_fr || ''),
    title_en: String(row.title_en || ''),
    subtitle_fr: String(row.subtitle_fr || ''),
    subtitle_en: String(row.subtitle_en || ''),
    summary_fr: String(row.summary_fr || ''),
    summary_en: String(row.summary_en || ''),
    description_fr: String(row.description_fr || ''),
    description_en: String(row.description_en || ''),
    client_name: (row.client_name as string | null) ?? null,
    project_year: (row.project_year as string | null) ?? null,
    role_fr: (row.role_fr as string | null) ?? null,
    role_en: (row.role_en as string | null) ?? null,
    deliverables_fr: Array.isArray(row.deliverables_fr) ? (row.deliverables_fr as string[]) : [],
    deliverables_en: Array.isArray(row.deliverables_en) ? (row.deliverables_en as string[]) : [],
    external_url: (row.external_url as string | null) ?? null,
    cover_asset_id: (row.cover_asset_id as string | null) ?? null,
    cover_image_url: String(row.cover_image_url || ''),
    cover_image_alt_fr: String(row.cover_image_alt_fr || ''),
    cover_image_alt_en: String(row.cover_image_alt_en || ''),
    cover_aspect: (row.cover_aspect as Project['cover_aspect']) || '4/5',
    video_url: (row.video_url as string | null) ?? null,
    video_webm_url: (row.video_webm_url as string | null) ?? null,
    video_poster_url: (row.video_poster_url as string | null) ?? null,
    gallery: gallery as Project['gallery'],
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export function getStaticPublishedProjects(): Project[] {
  return PUBLISHED_PROJECTS_SNAPSHOT.filter((p) => p.status === 'published').sort(
    (a, b) => a.sort_order - b.sort_order
  );
}

export async function fetchPublishedProjects(): Promise<{
  projects: Project[];
  source: 'supabase' | 'snapshot';
}> {
  const fallback = getStaticPublishedProjects();
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured) {
    return { projects: fallback, source: 'snapshot' };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const { data, error } = await client
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal);

    clearTimeout(timer);

    if (error || !data || data.length === 0) {
      return { projects: fallback, source: 'snapshot' };
    }

    const remoteProjects = data.map((row) => normalizeRow(row as Record<string, unknown>));

    const snapshotBySlug = new Map(fallback.map((p) => [p.slug, p]));
    const enriched = remoteProjects.map((proj) => {
      const local = snapshotBySlug.get(proj.slug);
      if (!local) return proj;
      return {
        ...proj,
        cover_asset_id: proj.cover_image_url.startsWith('http') ? null : local.cover_asset_id,
        video_poster_asset_id:
          proj.video_poster_url && proj.video_poster_url.startsWith('http')
            ? null
            : local.video_poster_asset_id,
      };
    });

    return { projects: enriched, source: 'supabase' };
  } catch {
    return { projects: fallback, source: 'snapshot' };
  }
}

export async function submitContactMessage(
  payload: ContactPayload
): Promise<{ ok: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client || !isSupabaseConfigured) {
    return { ok: false, error: 'supabase_unconfigured' };
  }

  try {
    const { error } = await client.from('contact_messages').insert({
      full_name: payload.full_name.trim(),
      email: payload.email.trim(),
      phone: payload.phone?.trim() || null,
      service: payload.service || null,
      message: payload.message.trim(),
      locale: payload.locale,
    });

    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network_error' };
  }
}

/* ============================================================================
 * ADMINISTRATION (Auth + RLS Supabase)
 * ============================================================================ */

export async function checkIsAdminUser(): Promise<{
  authenticated: boolean;
  isAdmin: boolean;
  email: string | null;
}> {
  const client = getSupabaseClient();
  if (!client) return { authenticated: false, isAdmin: false, email: null };

  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.user) {
    return { authenticated: false, isAdmin: false, email: null };
  }

  const { data, error } = await client
    .from('admin_users')
    .select('user_id, email')
    .eq('user_id', session.user.id)
    .maybeSingle();

  return {
    authenticated: true,
    isAdmin: Boolean(!error && data),
    email: session.user.email ?? null,
  };
}

export async function fetchAllProjectsAdmin(): Promise<Project[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');

  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((row) => normalizeRow(row as Record<string, unknown>));
}

export async function saveProjectAdmin(
  project: Omit<Project, 'id'> & { id?: string }
): Promise<Project> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');

  const payload = {
    slug: project.slug.trim().toLowerCase(),
    category: project.category,
    status: project.status,
    featured: project.featured,
    sort_order: project.sort_order,
    origine_non_verifiee: Boolean(project.origine_non_verifiee),
    demo: Boolean(project.demo),
    title_fr: project.title_fr.trim(),
    title_en: project.title_en.trim(),
    subtitle_fr: project.subtitle_fr.trim(),
    subtitle_en: project.subtitle_en.trim(),
    summary_fr: project.summary_fr.trim(),
    summary_en: project.summary_en.trim(),
    description_fr: project.description_fr.trim(),
    description_en: project.description_en.trim(),
    client_name: project.client_name?.trim() || null,
    project_year: project.project_year?.trim() || null,
    role_fr: project.role_fr?.trim() || null,
    role_en: project.role_en?.trim() || null,
    deliverables_fr: project.deliverables_fr.filter(Boolean),
    deliverables_en: project.deliverables_en.filter(Boolean),
    external_url: project.external_url?.trim() || null,
    cover_image_url: project.cover_image_url.trim(),
    cover_image_alt_fr: project.cover_image_alt_fr.trim(),
    cover_image_alt_en: project.cover_image_alt_en.trim(),
    cover_aspect: project.cover_aspect,
    video_url: project.video_url?.trim() || null,
    video_webm_url: project.video_webm_url?.trim() || null,
    video_poster_url: project.video_poster_url?.trim() || null,
    gallery: project.gallery,
  };

  if (project.id) {
    const { data, error } = await client
      .from('projects')
      .update(payload)
      .eq('id', project.id)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRow(data as Record<string, unknown>);
  } else {
    const { data, error } = await client
      .from('projects')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;
    return normalizeRow(data as Record<string, unknown>);
  }
}

export async function deleteProjectAdmin(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');
  const { error } = await client.from('projects').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Supprime en un clic TOUS les projets marqués demo = true en base
 * ainsi que les éventuels fichiers présents dans demo/ sur Supabase Storage.
 */
export async function deleteAllDemoProjectsAdmin(): Promise<number> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');

  const { data: deletedRows, error } = await client
    .from('projects')
    .delete()
    .eq('demo', true)
    .select('id');
  if (error) throw error;

  // Purge optionnelle des fichiers du dossier demo/ dans Supabase Storage
  try {
    const { data: files } = await client.storage.from('portfolio-media').list('demo', {
      limit: 100,
    });
    if (files && files.length > 0) {
      await client.storage
        .from('portfolio-media')
        .remove(files.map((f) => `demo/${f.name}`));
    }
  } catch {
    // Non bloquant si dossier demo/ vide
  }

  return deletedRows?.length || 0;
}

export async function updateProjectOrderAdmin(orderedIds: string[]): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');
  await Promise.all(
    orderedIds.map((id, index) =>
      client.from('projects').update({ sort_order: index + 1 }).eq('id', id)
    )
  );
}

export async function uploadMediaAdmin(
  file: File,
  folder: 'published' | 'drafts' | 'demo' = 'published'
): Promise<{ publicUrl: string; path: string }> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');

  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('Fichier trop lourd (maximum 25 Mo pour préserver le quota Supabase).');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeBase = file.name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const path = `${folder}/${Date.now()}-${safeBase || 'media'}.${ext}`;

  const { error } = await client.storage.from('portfolio-media').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = client.storage.from('portfolio-media').getPublicUrl(path);

  return { publicUrl, path };
}

export async function fetchContactMessagesAdmin(): Promise<ContactMessage[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');
  const { data, error } = await client
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as ContactMessage[];
}

export async function toggleMessageReadAdmin(id: string, isRead: boolean): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');
  const { error } = await client
    .from('contact_messages')
    .update({ is_read: isRead })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteMessageAdmin(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase non configuré.');
  const { error } = await client.from('contact_messages').delete().eq('id', id);
  if (error) throw error;
}
