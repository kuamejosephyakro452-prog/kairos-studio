-- ============================================================================
-- KAIROS STUDIO — Migration Phase 2 : marqueurs origine_non_verifiee & demo
-- Non destructive (IF NOT EXISTS).
-- ============================================================================

alter table public.projects
  add column if not exists origine_non_verifiee boolean not null default false,
  add column if not exists demo boolean not null default false;

create index if not exists idx_projects_flags on public.projects (origine_non_verifiee, demo);

-- Autoriser la lecture publique des fichiers dans demo/ également (en plus de published/)
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
