-- ============================================================
-- Account signup + developer approval
-- account_requests: pending sign-ups awaiting developer approval
-- accounts:        approved accounts that may log in (bcrypt password hash)
-- Both use the id + JSONB doc pattern and are written server-side via the
-- SECRET key, so RLS stays enabled with no public policies.
-- ============================================================

create table if not exists public.account_requests (
  id text primary key,
  doc jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.accounts (
  id text primary key,
  doc jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.account_requests enable row level security;
alter table public.accounts enable row level security;
