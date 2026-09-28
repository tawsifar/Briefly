-- ============================================================
-- Briefly: Supabase Database Schema
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================================

-- Create the briefs table
CREATE TABLE IF NOT EXISTS public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  source_text TEXT,
  brief_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own briefs
CREATE POLICY "Users can read own briefs"
  ON public.briefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own briefs"
  ON public.briefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own briefs"
  ON public.briefs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own briefs"
  ON public.briefs FOR DELETE
  USING (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_briefs_user_id ON public.briefs(user_id);
CREATE INDEX IF NOT EXISTS idx_briefs_updated_at ON public.briefs(updated_at DESC);
