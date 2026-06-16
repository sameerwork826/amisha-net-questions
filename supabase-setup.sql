-- Run this once in the Supabase SQL editor.
-- Stores each user's practice/mock history as a single JSON blob, keyed by the
-- Clerk user id (the JWT 'sub' claim). Requires Clerk's Supabase integration so
-- that auth.jwt() carries the Clerk session.

create table if not exists public.user_progress (
  user_id    text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

-- A user may read/write only their own row (Clerk user id == JWT sub).
create policy "own row - select"
  on public.user_progress for select
  using (auth.jwt() ->> 'sub' = user_id);

create policy "own row - insert"
  on public.user_progress for insert
  with check (auth.jwt() ->> 'sub' = user_id);

create policy "own row - update"
  on public.user_progress for update
  using (auth.jwt() ->> 'sub' = user_id)
  with check (auth.jwt() ->> 'sub' = user_id);
