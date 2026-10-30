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
