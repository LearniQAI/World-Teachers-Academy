// Blog posts, backed by the Supabase `posts` table. Reads use the anon client:
// RLS already limits anon to rows where published = true, and the explicit
// filter below keeps the intent obvious (and correct if RLS ever changes).
import { supabaseAnon } from "@/lib/supabase";

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_markdown: string;
  cover_image_url: string | null;
  category: string;
  author: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
}

// List views don't need the full markdown body.
export type PostSummary = Omit<Post, "body_markdown">;

const SUMMARY_COLUMNS = "id, slug, title, excerpt, cover_image_url, category, author, published, published_at, created_at";

// Data failures (e.g. migration not applied yet) degrade to an empty state
// instead of taking down every page — the side panel is in the root layout.
export async function getAllPublishedPosts(): Promise<PostSummary[]> {
  const { data, error } = await supabaseAnon
    .from("posts")
    .select(SUMMARY_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("getAllPublishedPosts failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getLatestPosts(limit: number): Promise<PostSummary[]> {
  const { data, error } = await supabaseAnon
    .from("posts")
    .select(SUMMARY_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getLatestPosts failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const { data, error } = await supabaseAnon
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("getPostBySlug failed:", error.message);
    return undefined;
  }
  return data ?? undefined;
}

export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
