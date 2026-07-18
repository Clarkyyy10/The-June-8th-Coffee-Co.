-- ============================================================
-- The June 8th Coffee Co. — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- ============================================================

-- Each table stores the application entity as a JSONB document keyed by id.
-- This mirrors the app's data model exactly and round-trips losslessly.

create table if not exists public.products (
  id text primary key,
  doc jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  doc jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  doc jsonb not null
);

create table if not exists public.employees (
  id text primary key,
  doc jsonb not null
);

create table if not exists public.stocks (
  id text primary key,
  doc jsonb not null
);

create table if not exists public.cup_sizes (
  id text primary key,
  doc jsonb not null,
  sort integer not null default 0
);

create table if not exists public.settings (
  id text primary key,
  doc jsonb not null
);

-- Enable Row Level Security. The app syncs through a server API route that
-- uses the SECRET (service) key, which bypasses RLS — so no public policies
-- are required. This keeps the anon/publishable key from writing data.
alter table public.products   enable row level security;
alter table public.orders     enable row level security;
alter table public.customers  enable row level security;
alter table public.employees  enable row level security;
alter table public.stocks     enable row level security;
alter table public.cup_sizes  enable row level security;
alter table public.settings   enable row level security;

-- Optional: allow the public (anon) key to READ data for future client-side
-- reads. Uncomment if you want read-only public access.
-- create policy "public read products"  on public.products  for select using (true);
-- create policy "public read orders"    on public.orders    for select using (true);
-- create policy "public read customers" on public.customers for select using (true);
-- create policy "public read employees" on public.employees for select using (true);
-- create policy "public read stocks"    on public.stocks    for select using (true);
-- create policy "public read cup_sizes" on public.cup_sizes for select using (true);
-- create policy "public read settings"  on public.settings  for select using (true);
