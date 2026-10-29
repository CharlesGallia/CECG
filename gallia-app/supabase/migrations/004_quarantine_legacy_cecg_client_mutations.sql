-- Ancien CECG : désactivation des autorisations historiques dangereuses.
-- Appliquer UNIQUEMENT après vérification du projet Supabase de l'ancienne app.
-- AUCUN accès public à la table des membres; aucun changement de statut/points côté client.
-- Cette migration ne touche ni SC GALLI ni la base Supabase courante si les tables
-- de l'ancienne application n'y existent pas.
BEGIN;
DO $lock$
BEGIN
 IF to_regclass('public.galliens') IS NOT NULL THEN
   EXECUTE 'ALTER TABLE public.galliens ENABLE ROW LEVEL SECURITY';
   EXECUTE 'DROP POLICY IF EXISTS "galliens_update_own" ON public.galliens';
   EXECUTE 'DROP POLICY IF EXISTS "galliens_public_verify" ON public.galliens';
   EXECUTE 'REVOKE UPDATE, DELETE ON public.galliens FROM anon, authenticated';
   EXECUTE 'REVOKE SELECT ON public.galliens FROM anon';
 END IF;
 IF to_regclass('public.merite_gallien') IS NOT NULL THEN
   EXECUTE 'ALTER TABLE public.merite_gallien ENABLE ROW LEVEL SECURITY';
   EXECUTE 'DROP POLICY IF EXISTS "merite_update_own" ON public.merite_gallien';
   EXECUTE 'REVOKE INSERT, UPDATE, DELETE ON public.merite_gallien FROM anon, authenticated';
 END IF;
END $lock$;
COMMIT;
NOTIFY pgrst, 'reload schema';
