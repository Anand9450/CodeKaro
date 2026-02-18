# Supabase Setup Instructions

1.  **Go to your Supabase Project Dashboard.**
2.  **Open the SQL Editor.**
3.  **Run the following SQL script** (Copy from `supabase_schema_full.sql` or below):

```sql
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
  id int primary key,
  title text not null,
  difficulty text,
  description text,
  slug text unique,
  starter_code text, -- JSON string or object
  test_cases jsonb,
  hidden_test_cases jsonb,
  meta_data jsonb,
  is_daily boolean default false,
  created_at timestamptz default now()
);

-- RLS Policies (Optional: Enable if needed via Dashboard)
alter table public.users enable row level security;
alter table public.problems enable row level security;

create policy "Enable access to all users" on public.users for select using (true);
create policy "Enable insert for all users" on public.users for insert with check (true);
create policy "Enable update for users based on ID" on public.users for update using (true); -- Simplified for MVP

create policy "Enable read access for all users" on public.problems for select using (true);
```

4.  **Confirm tables are created.**

# Vercel Environment Variables

Before deploying the backend, set these variables in your Vercel Project Settings (or add locally to `.env` if using `vercel env pull`):

-   `SUPABASE_URL`: Your Supabase URL.
-   `SUPABASE_ANON_KEY`: Your Supabase Anon Key.
-   `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (Required for Admin routes).
-   `JWT_SECRET`: A strong random string.
-   `PORT`: optional (Vercel sets this).
