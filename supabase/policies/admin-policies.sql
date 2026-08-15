-- Politiques RLS pour les admins
-- À exécuter dans l'éditeur SQL de Supabase

-- Les admins peuvent tout voir et tout modifier sur les prestataires (pour la validation)
create policy "Les admins voient tous les prestataires"
  on public.prestataires for select
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "Les admins modifient tous les prestataires"
  on public.prestataires for update
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Les admins peuvent voir les clients (lecture seule, pour les stats)
create policy "Les admins voient tous les clients"
  on public.clients for select
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Les admins peuvent voir toutes les demandes (pour les stats globales)
create policy "Les admins voient toutes les demandes"
  on public.demandes for select
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
