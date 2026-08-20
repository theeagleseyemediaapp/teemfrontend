-- Eagle's Eye Parliament – Categories Fix Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Fixes:
--   1. Drops the FK constraint on articles.category_slug (field stores comma-separated multi-category values)
--   2. Inserts all missing categories used by the platform

-- ============================================================
-- STEP 1: Drop the FK constraint that blocks multi-category posts
-- The category_slug column stores comma-separated slugs like "plenaries,senate"
-- A FK constraint only allows a single valid slug — incompatible with multi-category design.
-- ============================================================
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_slug_fkey;

-- ============================================================
-- STEP 2: Insert all missing categories (ON CONFLICT = safe to re-run)
-- ============================================================
INSERT INTO public.categories (slug, name, description) VALUES
  ('parliament',             'Parliament',             'Floor work, committees, and legislative updates.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('national-assembly',     'National Assembly',      'Lower house coverage and votes.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('senate',                'Senate',                 'Upper chamber reports and analysis.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('politics',              'Politics',               'Governance, elections, and power shifts.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('government',            'Government',             'Executive decisions and policy announcements.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('economy',               'Economy',                'Budget, finance, and markets.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('opinion',               'Opinion',                'Analysis and commentary.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('video',                 'Video',                  'News clips and live coverage.')
ON CONFLICT (slug) DO NOTHING;

-- NEW CATEGORIES
INSERT INTO public.categories (slug, name, description) VALUES
  ('plenaries',             'Plenaries',              'Full chamber plenary session coverage.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('committee-echoes',      'Committee Echoes',       'Reports and proceedings from committee sessions.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('networking',            'Networking',             'Parliamentary and political networking events.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('parliamentary-diplomacy', 'Parliamentary Diplomacy', 'Inter-parliamentary diplomacy and international relations.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('parliamentary-missions', 'Parliamentary Missions', 'Delegations, study missions, and field visits.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('constituency-actions',  'Constituency Actions',   'MPs at work in their constituencies.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('interviews',            'Interviews',             'Exclusive interviews with MPs and officials.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('bills-laws',            'Bills/Laws',             'Proposed and enacted legislation.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('opinions',              'Opinions',               'Expert opinions and editorial viewpoints.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('awards',                'Awards',                 'Parliamentary awards and recognitions.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('audio',                 'Audio',                  'Audio reports and podcasts.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description) VALUES
  ('podcast',               'Podcast',                'Podcast episodes and series.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- DONE: You can now create posts with multiple categories.
-- ============================================================
