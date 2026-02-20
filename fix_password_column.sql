-- Fix User Schema - Part 2 (Critical Columns)
-- Run this in your Supabase SQL Editor to add the missing password column

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
