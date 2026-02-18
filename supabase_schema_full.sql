-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  username text unique not null,
  email text unique not null,
  password text not null, -- Hashed password
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

-- Problems Table
create table if not exists public.problems (
  id int primary key, -- Manually assigned ID (1, 2, 3...) or auto-increment if you prefer
  title text not null,
  difficulty text, -- Easy, Medium, Hard
  description text,
  slug text unique,
  starter_code text, -- or jsonb if multiple languages
  test_cases jsonb, -- Array of {input, output}
  hidden_test_cases jsonb,
  meta_data jsonb, -- {name: "twoSum", params: [...]}
  is_daily boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies (Optional but recommended)
alter table public.users enable row level security;
alter table public.problems enable row level security;

-- Public read access to problems
create policy "Allow Public Read Problems" on public.problems
  for select using (true);

-- Users can read their own data (adjusted for public profile)
-- Allow public read for profiles
create policy "Allow Public Read User Profiles" on public.users
  for select using (true);

-- Users can update their own data
-- (Depends on how you handle auth in Supabase. 
-- Since we use custom authRoutes with JWT, RLS using auth.uid() might not work 
-- unless we use supabase.auth.signInWithPassword. 
-- For this backend-as-admin approach with Service Key, RLS is bypassed by the service key.)
