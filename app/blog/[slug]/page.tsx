import { notFound } from "next/navigation";
import PostBody from "@/components/blog/PostBody";
import { formatPostDate, getPostBySlug } from "@/lib/posts-data";

// Posts come from Supabase; re-check every 5 minutes.
export const revalidate = 300;

const INK_NAVY = "#0F172A";
const PAPER_DIM = "#6B7280";
const INDIGO = "#4F46E5";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | World Teachers Academy`,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="space-top space-extra-bottom">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-8 col-lg-9">
            <a href="/blog" style={{ color: INDIGO, fontWeight: 600, fontSize: "14px" }}>← All articles</a>

            <div style={{ margin: "18px 0 10px", fontSize: "14px", color: PAPER_DIM, display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <span style={{ color: INDIGO, fontWeight: 700 }}>{post.category}</span>
              {post.published_at && <span>{formatPostDate(post.published_at)}</span>}
              {post.author && <span>By {post.author}</span>}
            </div>

            <h1 style={{ fontSize: "40px", lineHeight: 1.2, color: INK_NAVY, marginBottom: "24px" }}>{post.title}</h1>

            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt={post.title}
                style={{ width: "100%", height: "auto", borderRadius: "14px", marginBottom: "32px", display: "block" }}
              />
            )}

            <PostBody markdown={post.body_markdown} />
          </div>
        </div>
      </div>
    </section>
  );
}
