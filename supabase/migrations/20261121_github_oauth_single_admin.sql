-- ============================================================================
-- KAIROS STUDIO — Migration Verrouillage Administrateur Unique & GitHub OAuth
-- Non destructive (idempotente).
-- Garantit côté PostgreSQL + RLS qu'UN SEUL compte administrateur existe et
-- qu'aucun autre compte GitHub ne peut lire les brouillons, lire les messages
-- ou modifier la base de données.
-- ============================================================================

-- 1. Ajouter la colonne github_username (facultative, informative et unique)
alter table public.admin_users
  add column if not exists github_username text unique;

-- 2. Contrainte singleton PostgreSQL : interdit physiquement plus d'1 ligne dans admin_users
create unique index if not exists idx_admin_users_single_admin
  on public.admin_users ((true));

-- 3. Renseigner le compte GitHub de l'administrateur unique (sans créer de doublon)
update public.admin_users
set github_username = 'kuamejosephyakro452-prog'
where lower(email) = 'kuamejosephyakro452@gmail.com';

-- 4. Renforcer public.is_kairos_admin() : vérifie l'appartenance à public.admin_users
--    ET l'absence de bannissement dans auth.users
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

-- 5. Vérifier que seul l'utilisateur authentifié correspondant à sa propre ligne peut lire admin_users
drop policy if exists "admin_users_self_select" on public.admin_users;
create policy "admin_users_self_select"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));
