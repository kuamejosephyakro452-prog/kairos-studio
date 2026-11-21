-- ============================================================================
-- KAIROS STUDIO — Schéma Supabase, Sécurité RLS & Storage
-- Projet dédié : kairos-studio
-- Sécurité :
--   - Inscriptions publiques DÉSACTIVÉES dans Supabase Dashboard (Auth > Providers)
--   - Un seul compte administrateur : kuamejosephyakro452@gmail.com (2FA recommandé)
--   - RLS activé sur TOUTES les tables et le bucket Storage
-- ============================================================================

-- Extensions nécessaires
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Table des administrateurs autorisés (verrouillage strict au-delà de auth.uid)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  github_username text unique,
  created_at timestamptz not null default now()
);

-- Contrainte singleton : garantit physiquement qu'un seul administrateur existe
create unique index if not exists idx_admin_users_single_admin on public.admin_users ((true));

alter table public.admin_users enable row level security;

-- Fonction helper SECURITY DEFINER vérifiant si l'utilisateur courant est l'admin unique autorisé
create or replace function public.is_kairos_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    join auth.users u on u.id = au.user_id
    where au.user_id = auth.uid()
      and (u.banned_until is null or u.banned_until <= now())
  );
$$;

drop policy if exists "admin_users_self_select" on public.admin_users;
create policy "admin_users_self_select"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Aucune insertion/suppression publique sur admin_users (gérée uniquement via SQL Editor / service_role)

-- ----------------------------------------------------------------------------
-- 2. Table des projets du portfolio
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  category text not null check (
    category in (
      'graphic-design',
      'audiovisual',
      'digital-communication',
      'digital-solutions',
      'web-creation'
    )
  ),
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  origine_non_verifiee boolean not null default false,
  demo boolean not null default false,

  -- Contenus bilingues FR / EN
  title_fr text not null,
  title_en text not null,
  subtitle_fr text not null default '',
  subtitle_en text not null default '',
  summary_fr text not null default '',
  summary_en text not null default '',
  description_fr text not null default '',
  description_en text not null default '',

  -- Métadonnées optionnelles (vides tant que non renseignées, jamais inventées)
  client_name text,
  project_year text,
  role_fr text,
  role_en text,
  deliverables_fr text[] not null default '{}',
  deliverables_en text[] not null default '{}',
  external_url text,

  -- Médias principaux
  cover_image_url text not null default '',
  cover_image_alt_fr text not null default '',
  cover_image_alt_en text not null default '',
  cover_aspect text not null default '4/5' check (cover_aspect in ('16/9', '4/5', '1/1', '9/16', '3/4')),
  video_url text,
  video_webm_url text,
  video_poster_url text,

  -- Galerie JSONB [{ id, type: 'image'|'video', url, webmUrl?, posterUrl?, alt_fr, alt_en, caption_fr?, caption_en?, aspect? }]
  gallery jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_status_order on public.projects (status, sort_order asc, created_at desc);
create index if not exists idx_projects_admin_order on public.projects (sort_order asc, created_at desc);
create index if not exists idx_projects_category on public.projects (category);
create index if not exists idx_projects_flags on public.projects (origine_non_verifiee, demo);

-- Trigger updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

alter table public.projects enable row level security;

-- Lecture publique STRICTEMENT limitée aux projets publiés
drop policy if exists "projects_public_read_published" on public.projects;
create policy "projects_public_read_published"
  on public.projects
  for select
  to anon
  using (status = 'published');

-- Lecture complète (publiés + brouillons) réservée à l'admin ; un user authentifié non-admin ne voit que les publiés
drop policy if exists "projects_auth_read" on public.projects;
create policy "projects_auth_read"
  on public.projects
  for select
  to authenticated
  using (status = 'published' or (select public.is_kairos_admin()));

-- Écriture réservée EXCLUSIVEMENT à l'admin vérifié
drop policy if exists "projects_admin_insert" on public.projects;
create policy "projects_admin_insert"
  on public.projects
  for insert
  to authenticated
  with check ((select public.is_kairos_admin()));

drop policy if exists "projects_admin_update" on public.projects;
create policy "projects_admin_update"
  on public.projects
  for update
  to authenticated
  using ((select public.is_kairos_admin()))
  with check ((select public.is_kairos_admin()));

drop policy if exists "projects_admin_delete" on public.projects;
create policy "projects_admin_delete"
  on public.projects
  for delete
  to authenticated
  using ((select public.is_kairos_admin()));

-- ----------------------------------------------------------------------------
-- 3. Table des messages de contact
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  service text,
  message text not null check (char_length(trim(message)) between 10 and 4000),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_created on public.contact_messages (created_at desc);
create index if not exists idx_contact_messages_unread on public.contact_messages (created_at desc) where is_read = false;

alter table public.contact_messages enable row level security;

-- Insertion publique autorisée pour le formulaire de contact
drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    char_length(trim(full_name)) between 2 and 120
    and char_length(trim(message)) between 10 and 4000
  );

-- Lecture, marquage lu et suppression réservés STRICTEMENT à l'admin
drop policy if exists "contact_messages_admin_select" on public.contact_messages;
create policy "contact_messages_admin_select"
  on public.contact_messages
  for select
  to authenticated
  using ((select public.is_kairos_admin()));

drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update"
  on public.contact_messages
  for update
  to authenticated
  using ((select public.is_kairos_admin()))
  with check ((select public.is_kairos_admin()));

drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_admin_delete"
  on public.contact_messages
  for delete
  to authenticated
  using ((select public.is_kairos_admin()));

-- ----------------------------------------------------------------------------
-- 4. Bucket Storage pour les médias uploadés depuis l'admin
--    Quota gratuit Supabase ~1 Go : limite par fichier fixée à 25 Mo
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  26214400, -- 25 Mo max par fichier
  array[
    'image/webp',
    'image/avif',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lecture publique uniquement dans le dossier published/ ou lecture globale du bucket public
-- Les fichiers brouillons doivent être placés sous drafts/ et protégés, ou le bucket public sert uniquement les visuels publiés.
drop policy if exists "storage_public_read_portfolio_media" on storage.objects;
create policy "storage_public_read_portfolio_media"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'portfolio-media'
    and (
      name like 'published/%'
      or name like 'demo/%'
      or public.is_kairos_admin()
    )
  );

drop policy if exists "storage_admin_insert_portfolio_media" on storage.objects;
create policy "storage_admin_insert_portfolio_media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'portfolio-media'
    and public.is_kairos_admin()
  );

drop policy if exists "storage_admin_update_portfolio_media" on storage.objects;
create policy "storage_admin_update_portfolio_media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and public.is_kairos_admin()
  )
  with check (
    bucket_id = 'portfolio-media'
    and public.is_kairos_admin()
  );

drop policy if exists "storage_admin_delete_portfolio_media" on storage.objects;
create policy "storage_admin_delete_portfolio_media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'portfolio-media'
    and public.is_kairos_admin()
  );

-- ----------------------------------------------------------------------------
-- 5. Attacher le compte admin unique (à exécuter après création du user Auth)
-- ----------------------------------------------------------------------------
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email = 'kuamejosephyakro452@gmail.com'
-- on conflict (user_id) do nothing;
