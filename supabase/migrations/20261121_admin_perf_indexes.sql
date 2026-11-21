-- ============================================================================
-- KAIROS STUDIO — Migration Performance Admin (Index & RLS InitPlan)
-- Non destructive (IF NOT EXISTS / CREATE OR REPLACE).
-- Objectif : accélérer les requêtes post-connexion (/admin) sans affaiblir RLS.
-- ============================================================================

-- 1. Index dédié au tri admin des projets (sans filtre status)
create index if not exists idx_projects_admin_order
  on public.projects (sort_order asc, created_at desc);

-- 2. Index partiel pour le comptage HEAD des messages non lus
create index if not exists idx_contact_messages_unread
  on public.contact_messages (created_at desc)
  where is_read = false;

-- 3. Optimisation RLS InitPlan : (select auth.uid()) et (select public.is_kairos_admin())
--    évalués une seule fois par requête SQL au lieu d'une fois par ligne.
drop policy if exists "admin_users_self_select" on public.admin_users;
create policy "admin_users_self_select"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "projects_auth_read" on public.projects;
create policy "projects_auth_read"
  on public.projects
  for select
  to authenticated
  using (status = 'published' or (select public.is_kairos_admin()));

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
