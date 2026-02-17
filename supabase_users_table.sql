-- Create a users table
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  role text default 'user',
  created_at timestamptz default now()
);

-- (Optional) Enable RLS
alter table public.users enable row level security;

-- Allow authenticated admins to view all users
create policy "Allow Access For Admins" on public.users
  for select
  using (
    auth.role() = 'authenticated' and (
      role = 'admin' or
      auth.uid() = id
    )
  );

-- Insert a test admin user (you must create auth user first if using Auth)
-- For demo purposes:
insert into public.users (email, role) values ('admin@codekaro.com', 'admin');
