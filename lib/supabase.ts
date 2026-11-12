import { createClient } from "@supabase/supabase-js";

// Production sets all three variables, so behaviour there is unchanged.
// Preview/staging builds have none of them (they are production-only in
// Vercel), and createClient() throws "supabaseUrl is required" at import time,
// which failed every preview build. Without the variables we fall back to an
// unreachable local address: the build succeeds, and any database call in a
// preview fails instead of touching production data.
const PREVIEW_FALLBACK_URL = "http://127.0.0.1:54321";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PREVIEW_FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "preview-no-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "preview-no-key";

// Safe to use anywhere: `jobs` SELECT is public via RLS, no write access.
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Server-side only. Bypasses RLS — never import this into client components.
export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey);
