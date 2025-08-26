import { createClient } from '@supabase/supabase-js';

// Placeholder keys – replace with real values.
// 1) SUPABASE_URL -> e.g. https://<project>.supabase.co
// 2) SUPABASE_ANON_KEY -> Project Settings > API > anon public
// 3) For Kakao: enable Kakao provider in Auth > Providers and set Redirect URL
//    (e.g. https://localhost:3000/auth/v1/callback or deployed domain)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'anon-placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
