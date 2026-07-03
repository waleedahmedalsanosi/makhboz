import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// قراءة عامة — يستخدم anon key ويخضع لسياسات RLS (يكفي لكل الصفحات العامة)
export function createServerClient() {
  return createClient(SUPABASE_URL, ANON_KEY)
}

// عمليات الإدارة — يستخدم service key إذا توفر، وإلا يرجع للـ anon key
export function createAdminClient() {
  return createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || ANON_KEY)
}
