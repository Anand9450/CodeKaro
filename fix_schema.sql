-- Fix User Schema
-- Run this in your Supabase SQL Editor

-- 1. Create columns if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS solved_problems TEXT[] DEFAULT '{}'; -- Changed from jsonb to text array for simpler query
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS github TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS leetcode TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS codeforces TEXT;

-- 2. Clear out any bad data (optional, only if needed)
-- DELETE FROM public.problems; 

-- 3. Ensure Problems Table Exists
CREATE TABLE IF NOT EXISTS public.problems (
  id INT PRIMARY KEY,
  title TEXT NOT NULL,
  difficulty TEXT,
  description TEXT,
  slug TEXT UNIQUE,
  example_test_cases TEXT, -- Often stored as string
  topic_tags TEXT, -- Store as comma separated or array
  is_daily BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
