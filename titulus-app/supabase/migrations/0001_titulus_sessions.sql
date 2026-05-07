-- ─────────────────────────────────────────────────────────────────
-- Migration : Titulus Civilis — sessions déclarants + KYC bucket
-- À exécuter dans Supabase SQL Editor (https://supabase.com/dashboard
-- → ton projet → SQL Editor → New query → coller → Run)
-- ─────────────────────────────────────────────────────────────────

-- 1. Table principale : sessions déclarants
create table if not exists public.titulus_sessions (
  uuid                uuid primary key default gen_random_uuid(),
  status              text not null default 'IDENTITE_OK'
                      check (status in (
                        'IDENTITE_OK', 'PAIEMENT_OK', 'DECLARATIO_OK',
                        'DECLARATIO_SIGNEE', 'KYC_TRANSMIS',
                        'KYC_VALIDE', 'KYC_REFUSE'
                      )),
  numero_declaratio   text unique,
  -- Identité (étape I)
  prenom              text,
  nom                 text,
  email               text,
  -- Declaratio (étape III)
  nom_gallien         text,
  date_naissance      date,
  lieu_naissance      text,
  pays_naissance      text,
  nationalite         text,
  numero_voie         text,
  complement_adresse  text,
  code_postal         text,
  ville               text,
  pays                text,
  telephone           text,
  -- Signature (étape IV) — base64 PNG du tracé
  signature_data_url  text,
  pdf_hash            text,
  signature_ip        inet,
  -- KYC (étape V) — uniquement les chemins du bucket, pas le contenu
  kyc_recto_path      text,
  kyc_selfie_path     text,
  kyc_preuve_path     text,
  kyc_purge_at        timestamptz,
  -- Stripe
  stripe_session_id   text,
  stripe_payment_intent text,
  -- Consentements (jsonb pour souplesse)
  consents            jsonb default '{}'::jsonb,
  -- Méta
  hcaptcha_token_hash text,
  user_agent          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Index utiles
create index if not exists titulus_sessions_email_idx       on public.titulus_sessions (email);
create index if not exists titulus_sessions_status_idx      on public.titulus_sessions (status);
create index if not exists titulus_sessions_stripe_idx      on public.titulus_sessions (stripe_session_id);
create index if not exists titulus_sessions_kyc_purge_idx   on public.titulus_sessions (kyc_purge_at);

-- Trigger updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

drop trigger if exists trg_titulus_sessions_updated on public.titulus_sessions;
create trigger trg_titulus_sessions_updated
  before update on public.titulus_sessions
  for each row execute function public.set_updated_at();

-- 2. Row Level Security
-- Le funnel utilise la clé service_role (côté API serverless) pour écrire.
-- Aucun accès anon : on bloque tout par défaut.
alter table public.titulus_sessions enable row level security;

drop policy if exists titulus_sessions_no_anon on public.titulus_sessions;
create policy titulus_sessions_no_anon on public.titulus_sessions
  for all to anon using (false) with check (false);

-- 3. Bucket privé KYC (Storage)
-- À exécuter via UI Supabase : Storage → Create new bucket → Name: kyc-temp
-- Public: OFF (privé).
-- Politique : seul le service_role peut lire/écrire (par défaut quand public=OFF).
-- Pour automatiser via SQL :
insert into storage.buckets (id, name, public)
  values ('kyc-temp', 'kyc-temp', false)
  on conflict (id) do nothing;

-- 4. Fonction de purge KYC (à appeler par cron toutes les heures)
create or replace function public.purge_kyc_files() returns void as $$
declare
  rec record;
begin
  for rec in
    select uuid, kyc_recto_path, kyc_selfie_path, kyc_preuve_path
    from public.titulus_sessions
    where kyc_purge_at is not null
      and kyc_purge_at < now()
      and (kyc_recto_path is not null
           or kyc_selfie_path is not null
           or kyc_preuve_path is not null)
  loop
    if rec.kyc_recto_path is not null then
      delete from storage.objects where bucket_id='kyc-temp' and name=rec.kyc_recto_path;
    end if;
    if rec.kyc_selfie_path is not null then
      delete from storage.objects where bucket_id='kyc-temp' and name=rec.kyc_selfie_path;
    end if;
    if rec.kyc_preuve_path is not null then
      delete from storage.objects where bucket_id='kyc-temp' and name=rec.kyc_preuve_path;
    end if;
    update public.titulus_sessions
       set kyc_recto_path = null,
           kyc_selfie_path = null,
           kyc_preuve_path = null,
           kyc_purge_at = null
     where uuid = rec.uuid;
  end loop;
end $$ language plpgsql security definer;

-- 5. Cron via pg_cron (à activer dans Supabase Dashboard → Database → Extensions → pg_cron)
-- Cette ligne échouera si pg_cron n'est pas activé : c'est attendu, active-le puis re-roule.
-- select cron.schedule('titulus-kyc-purge', '0 * * * *', $$select public.purge_kyc_files()$$);
