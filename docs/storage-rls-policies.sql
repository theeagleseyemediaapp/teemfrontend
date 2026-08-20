-- Eagle's Eye Media – Storage RLS Policies (Secured)
-- Run this entire block in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Ensure media bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
  VALUES ('media', 'media', true)
  ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Public SELECT (read)
DROP POLICY IF EXISTS "Allow public read of media" ON storage.objects;
CREATE POLICY "Allow public read of media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- 4. INSERT (upload) — Securely disabled for public/anonymous users.
-- Only backend service_role client (bypasses RLS) can write files.
DROP POLICY IF EXISTS "Allow public insert of media" ON storage.objects;

-- 5. UPDATE (upsert) — Securely disabled for public/anonymous users.
DROP POLICY IF EXISTS "Allow public update of media" ON storage.objects;

-- 6. DELETE — Securely disabled for public/anonymous users.
DROP POLICY IF EXISTS "Allow public delete of media" ON storage.objects;
