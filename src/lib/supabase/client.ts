import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fbggjnzsvdczlatwwhvk.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_UZeJVIbFM6p-aA0tz-Wx_g_U3fZdjKq';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
