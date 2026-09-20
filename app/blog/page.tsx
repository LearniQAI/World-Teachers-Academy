import { getAllPublishedPosts, formatPostDate } from "@/lib/posts-data";

// Posts come from Supabase; re-check every 5 minutes.
export const revalidate = 300;

const DELAYS = [".3", ".5", ".7"];

export default async function Blog() {
  const posts = await getAllPublishedPosts();

  return (
    <>
      <img
        src="/assets/Blog-herosection.jpg"
        alt="World Teachers Academy Blog"
        style={{ display: "block", width: "100%", height: "auto" }}
      />
      {/*==============================
Blog Area
==============================*/}
      <section className="space-top space-extra-bottom" id="blog-sec">
        <div className="container">
          {posts.length === 0 ? (
            <p className="text-center mb-0" style={{ color: "#6B7280" }}>
              No articles have been published yet — check back soon.
            </p>
          ) : (
            <div className="row gy-40">
              {posts.map((post, i) => (
                <div className="col-lg-4 col-md-6 th_fade_anim" data-delay={DELAYS[i % 3]} key={post.id}>
                  <div className="blog-card" style={{ border: "1px solid #E2E5EE", borderRadius: "16px", overflow: "hidden", height: "100%" }}>
                    {post.cover_image_url && (
                      <div className="blog-img">
                        <a href={`/blog/${post.slug}`}>
                          <img src={post.cover_image_url} alt={post.title} style={{ width: "100%", height: "auto", display: "block" }} />
                        </a>
                      </div>
                    )}
                    <div className="blog-content" style={{ padding: "24px 30px 30px" }}>
                      <div className="blog-meta">
                        <span>{post.category}</span>
                        {post.published_at && <span>{formatPostDate(post.published_at)}</span>}
                      </div>
                      <h2 className="box-title">
                        <a href={`/blog/${post.slug}`}>{post.title}</a>
                      </h2>
                      {post.excerpt && <p className="blog-text">{post.excerpt}</p>}
                      <a href={`/blog/${post.slug}`} className="th-btn style4 btn-sm">READ MORE</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
