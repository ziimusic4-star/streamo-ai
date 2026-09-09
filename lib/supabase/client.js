import { createBrowserClient } from "@supabase/ssr";

// Used inside Client Components. The anon key is safe to expose here by
// design — real protection comes from the RLS policies in supabase-schema.sql,
// not from hiding this key.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
