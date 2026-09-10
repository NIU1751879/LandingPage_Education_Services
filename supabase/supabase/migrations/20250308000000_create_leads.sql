create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  message text not null,
  interest text,
  country text,
  referrer text,
  newsletter_opt_in boolean not null default false,
  source text not null default 'website',
  status text not null default 'new'
);

create index if not exists leads_email_idx on public.leads (email);
create index if not exists leads_created_at_idx on public.leads (created_at);
create index if not exists leads_interest_idx on public.leads (interest);
create index if not exists leads_status_idx on public.leads (status);

alter table public.leads enable row level security;
