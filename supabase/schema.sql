-- Secure server-side schema for Quality Performance Meetings Dashboard.
-- Run this in the Supabase SQL Editor.
-- The browser must never receive the Supabase secret key.

create table if not exists public.dashboard_users (
  id text primary key,
  username text not null unique,
  name text not null,
  role text not null default 'Quality Engineer',
  color text not null default 'bg-indigo-600',
  photo_url text,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.dashboard_users enable row level security;
revoke all on public.dashboard_users from anon, authenticated;

create table if not exists public.dashboard_sessions (
  token_hash text primary key,
  user_id text not null references public.dashboard_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.dashboard_sessions enable row level security;
revoke all on public.dashboard_sessions from anon, authenticated;

alter table public.dashboard_state enable row level security;
revoke all on public.dashboard_state from anon, authenticated;

create index if not exists dashboard_sessions_user_id_idx
  on public.dashboard_sessions(user_id);
create index if not exists dashboard_sessions_expires_at_idx
  on public.dashboard_sessions(expires_at);
