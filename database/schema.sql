create extension if not exists pgcrypto;

create type opportunity_sector as enum ('Publico', 'Privado');
create type opportunity_type as enum ('Preprofesional', 'Profesional', 'Empleo', 'CAS');
create type opportunity_modality as enum ('Presencial', 'Hibrido', 'Remoto');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector opportunity_sector not null,
  website_url text,
  created_at timestamptz not null default now()
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  organization_id uuid not null references organizations(id) on delete restrict,
  type opportunity_type not null,
  department text not null,
  province text,
  modality opportunity_modality not null,
  vacancies integer not null default 1 check (vacancies > 0),
  ends_at date not null,
  stipend text not null,
  summary text not null,
  requirements text[] not null default '{}',
  steps text[] not null default '{}',
  source_name text not null,
  source_url text not null,
  published_at date not null default current_date,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table opportunity_careers (
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  career text not null,
  primary key (opportunity_id, career)
);

create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  category text not null,
  read_time text not null,
  body text[] not null default '{}',
  published_at date not null default current_date,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index opportunities_search_idx
  on opportunities using gin (
    to_tsvector(
      'spanish',
      title || ' ' || summary || ' ' || department || ' ' || coalesce(province, '')
    )
  );

create index opportunities_department_idx on opportunities(department);
create index opportunities_ends_at_idx on opportunities(ends_at);
create index opportunities_published_idx on opportunities(is_published, published_at desc);
create index opportunity_careers_career_idx on opportunity_careers(career);
create index articles_published_idx on articles(is_published, published_at desc);

alter table organizations enable row level security;
alter table opportunities enable row level security;
alter table opportunity_careers enable row level security;
alter table articles enable row level security;

create policy "public can read organizations"
  on organizations for select
  using (true);

create policy "public can read published opportunities"
  on opportunities for select
  using (is_published = true);

create policy "public can read careers for published opportunities"
  on opportunity_careers for select
  using (
    exists (
      select 1
      from opportunities
      where opportunities.id = opportunity_careers.opportunity_id
        and opportunities.is_published = true
    )
  );

create policy "public can read published articles"
  on articles for select
  using (is_published = true);
