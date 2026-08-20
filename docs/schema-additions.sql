-- Eagle's Eye Parliament – Schema Additions
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Analytics events table for tracking page views and engagement
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text,
  event_type text,
  event_name text,
  path text,
  metadata jsonb,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read analytics" ON public.analytics_events
  FOR SELECT USING (auth.role() = 'service_role');

-- 2. Live config table (persists Watch Live settings across restarts)
CREATE TABLE IF NOT EXISTS public.live_config (
  id text PRIMARY KEY,
  video_id text NOT NULL DEFAULT 'jfKfPfyJRdk',
  mode text NOT NULL DEFAULT 'live',
  updated_at timestamp with time zone DEFAULT now()
);

-- Seed default row
INSERT INTO public.live_config (id, video_id, mode)
  VALUES ('default', 'jfKfPfyJRdk', 'live')
  ON CONFLICT (id) DO NOTHING;

-- 3. Unique constraints to prevent duplicate data
-- Unique slug on articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'articles' AND indexname = 'articles_slug_unique'
  ) THEN
    CREATE UNIQUE INDEX articles_slug_unique ON public.articles (slug);
  END IF;
END $$;

-- Unique email on newsletter_subscribers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'newsletter_subscribers' AND indexname = 'newsletter_subscribers_email_unique'
  ) THEN
    CREATE UNIQUE INDEX newsletter_subscribers_email_unique ON public.newsletter_subscribers (email);
  END IF;
END $$;

-- 4. Partnership inquiries table
CREATE TABLE IF NOT EXISTS public.partnership_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  phone text,
  inquiry_type text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

