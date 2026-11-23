-- Run this in Supabase SQL Editor to create the registration endpoint's table.
create table if not exists public.registrations (
  id bigint generated always as identity primary key,
  request_id uuid not null unique,
  first_name text not null check (char_length(first_name) between 1 and 100),
  last_name text not null check (char_length(last_name) between 1 and 100),
  email text not null unique check (char_length(email) <= 254),
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  location text not null check (char_length(location) between 1 and 200),
  prayer_request text not null default '' check (char_length(prayer_request) <= 4000),
  confidential boolean not null default false,
  followup boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.registrations enable row level security;

-- Public visitors can submit registrations but cannot read or change any records.
revoke all on table public.registrations from anon, authenticated;
grant insert on table public.registrations to anon;

drop policy if exists "Public can submit registrations" on public.registrations;
create policy "Public can submit registrations"
  on public.registrations
  for insert
  to anon
  with check (true);

-- The identity column's sequence needs usage permission for anonymous inserts.
grant usage on sequence public.registrations_id_seq to anon;
