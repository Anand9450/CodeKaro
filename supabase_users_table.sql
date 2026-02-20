-- 1. Reset: Disable RLS temporarily to ensure access (simplest fix for MVP)
alter table public.users disable row level security;
alter table public.problems disable row level security;

-- 2. (Optional) If you want RLS, use these permissive policies:
-- drop policy if exists "Enable all access for users" on public.users;
-- alter table public.users enable row level security;
-- create policy "Enable all access for users" on public.users for all using (true) with check (true);

-- 3. Ensure tables exist (just in case)
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  email text unique not null,
  password text not null,
  full_name text,
  bio text,
  profile_picture text,
  role text default 'user',
  score int default 0,
  coins int default 0,
  streak int default 0,
  last_solved_date date,
  solved_problems jsonb default '[]'::jsonb,
  daily_coin_collected boolean default false,
  linkedin text,
  github text,
  mobile text,
  leetcode text,
  codeforces text,
  created_at timestamptz default now()
);
