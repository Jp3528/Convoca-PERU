-- Instalación inicial de Convoca Perú en una base nueva
-- Alternativa a ejecutar 002, 003 y 004 por separado.
begin;

-- Run once in the Supabase SQL editor. No browser gets a service-role key.
create table if not exists public.portal_documents (
  id uuid primary key,
  kind text not null check (kind in ('opportunity','article','message','import')),
  slug text not null default '',
  payload jsonb not null,
  status text not null check (status in ('draft','published','archived')),
  sample boolean not null default false,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revision integer not null default 1,
  constraint portal_import_never_published check (kind <> 'import' or (status <> 'published' and verified = false and sample = false))
);
create unique index if not exists portal_unique_slug on public.portal_documents(kind,slug) where kind <> 'message';
create index if not exists portal_published on public.portal_documents(kind,status,updated_at desc);
alter table public.portal_documents enable row level security;
revoke all on public.portal_documents from anon, authenticated;
grant all on public.portal_documents to service_role;
create table if not exists public.portal_rate_limits (bucket text primary key, hits integer not null, started_at timestamptz not null);
alter table public.portal_rate_limits enable row level security;
revoke all on public.portal_rate_limits from anon, authenticated;
create or replace function public.consume_portal_limit(bucket_key text, max_hits integer, window_seconds integer)
returns boolean language plpgsql security definer set search_path=public as $$
declare current_hits integer;
begin
  insert into portal_rate_limits(bucket,hits,started_at) values(bucket_key,1,clock_timestamp())
  on conflict(bucket) do update set
    hits=case when portal_rate_limits.started_at < clock_timestamp()-make_interval(secs=>window_seconds) then 1 else portal_rate_limits.hits+1 end,
    started_at=case when portal_rate_limits.started_at < clock_timestamp()-make_interval(secs=>window_seconds) then clock_timestamp() else portal_rate_limits.started_at end
  returning hits into current_hits;
  delete from portal_rate_limits where started_at < clock_timestamp()-interval '1 day';
  return current_hits <= max_hits;
end $$;
revoke all on function public.consume_portal_limit(text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_portal_limit(text,integer,integer) to service_role;


-- After 002 and 003. Private job state + atomic lease for serverless workers.
create table if not exists public.portal_import_automation (
  key text primary key check (key = 'main'),
  state jsonb not null,
  lease_token uuid not null,
  lease_until timestamptz not null,
  next_run_at timestamptz not null
);
alter table public.portal_import_automation enable row level security;
revoke all on public.portal_import_automation from anon, authenticated;
grant all on public.portal_import_automation to service_role;

create or replace function public.claim_import_job(job_token uuid, initial_state jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare claimed text;
begin
  insert into portal_import_automation(key,state,lease_token,lease_until,next_run_at)
  values('main',initial_state,job_token,clock_timestamp()+interval '180 seconds',clock_timestamp())
  on conflict(key) do update set state=excluded.state, lease_token=excluded.lease_token,
    lease_until=excluded.lease_until, next_run_at=excluded.next_run_at
  where portal_import_automation.lease_until <= clock_timestamp() and portal_import_automation.next_run_at <= clock_timestamp()
  returning key into claimed;
  return claimed is not null;
end $$;
create or replace function public.complete_import_job(job_token uuid, completed_state jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare completed text;
begin
  update portal_import_automation set state=completed_state, lease_until=clock_timestamp(),
    next_run_at=(completed_state->>'nextRunAt')::timestamptz
  where key='main' and lease_token=job_token returning key into completed;
  return completed is not null;
end $$;
revoke all on function public.claim_import_job(uuid,jsonb) from public, anon, authenticated;
revoke all on function public.complete_import_job(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.claim_import_job(uuid,jsonb) to service_role;
grant execute on function public.complete_import_job(uuid,jsonb) to service_role;


commit;

select tablename, rowsecurity from pg_tables where schemaname='public' and tablename in ('portal_documents','portal_rate_limits','portal_import_automation') order by tablename;
