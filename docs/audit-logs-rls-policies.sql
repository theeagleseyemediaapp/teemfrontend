-- Eagle's Eye Media – Audit Logs Table RLS Policies
-- Run this block in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Enable RLS on the audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Allow public/anyone to insert audit logs
-- (Safe because: actor_id is validated via foreign key to profiles, SELECT is still protected, and backend needs to write logs regardless of key type)
DROP POLICY IF EXISTS "Allow anyone to insert audit logs" ON public.audit_logs;
CREATE POLICY "Allow anyone to insert audit logs" ON public.audit_logs
  FOR INSERT
  WITH CHECK (true);

-- 3. Allow admins (super_admin, admin) to read audit logs
DROP POLICY IF EXISTS "Allow admins to read audit logs" ON public.audit_logs;
CREATE POLICY "Allow admins to read audit logs" ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
  );

-- 4. Allow service role key full access (bypass RLS)
DROP POLICY IF EXISTS "Allow service role full access to audit logs" ON public.audit_logs;
CREATE POLICY "Allow service role full access to audit logs" ON public.audit_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
