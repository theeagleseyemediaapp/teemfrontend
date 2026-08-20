import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://sqmqxthmgoiqngwgxpfi.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxbXF4dGhtZ29pcW5nd2d4cGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzMxNDcsImV4cCI6MjA5NzY0OTE0N30.5Ur7ADufyAsCBJbewtNFtsmLddK38H1kiTdHtdTC9fk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
