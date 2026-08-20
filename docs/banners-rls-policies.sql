-- Eagle's Eye Media – Banners Table RLS Policies
-- Run this block in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Enable RLS on the banners table
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 2. Allow public read of all banners (so they show up on the site and mobile app)
DROP POLICY IF EXISTS "Allow public read of banners" ON public.banners;
CREATE POLICY "Allow public read of banners" ON public.banners
  FOR SELECT USING (true);

-- 3. Allow admins (super_admin, admin) to insert, update, and delete banners
DROP POLICY IF EXISTS "Allow admins full access to banners" ON public.banners;
CREATE POLICY "Allow admins full access to banners" ON public.banners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  );

-- 4. Allow service role key to bypass and have full access
DROP POLICY IF EXISTS "Allow service role full access to banners" ON public.banners;
CREATE POLICY "Allow service role full access to banners" ON public.banners
  FOR ALL TO service_role USING (true) WITH CHECK (true);
