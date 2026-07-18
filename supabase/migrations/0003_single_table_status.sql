-- ============================================================
-- Consolidate account approval into a single table.
-- account_requests now carries a top-level `status` column
-- ('pending' | 'approved' | 'rejected'), so approving is a single field
-- edit (works from the Supabase dashboard on any device, including mobile).
-- The separate `accounts` table is removed; login reads approved requests.
-- ============================================================

alter table public.account_requests
  add column if not exists status text not null default 'pending';

-- Backfill the top-level status from the JSON doc where present.
update public.account_requests
  set status = coalesce(doc->>'status', 'pending');

drop table if exists public.accounts;
