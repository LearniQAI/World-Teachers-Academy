import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Safe to use anywhere: `jobs` SELECT is public via RLS, no write access.
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Server-side only. Bypasses RLS — never import this into client components.
export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey);
