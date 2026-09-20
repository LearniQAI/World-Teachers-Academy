// Shell only — no real posts exist yet. Replace PLACEHOLDER_POSTS with real
// content (and link each card to its own post route) once articles are published.
const PLACEHOLDER_POSTS = [
  { category: "Teaching Abroad" },
  { category: "Certification News" },
  { category: "Community Stories" },
  { category: "Teaching Abroad" },
  { category: "Certification News" },
  { category: "Community Stories" },
];

const DELAYS = [".3", ".5", ".7", ".3", ".5", ".7"];

export default function Blog() {
  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <div className="breadcumb-wrapper " data-bg-src="/assets/img/bg/breadcumb-bg.png">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="breadcumb-content">
                <h1 className="breadcumb-title">Blog</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li>Blog</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-5 align-self-end d-lg-block d-none">
              <div className="breadcumb-thumb">
                <img src="/assets/img/normal/breadcumb-thumb1-1.png" alt="img" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*==============================
Blog Area
==============================*/}
      <section className="space-top space-extra-bottom" id="blog-sec">
        <div className="container">
          <div className="row gy-40">
            {PLACEHOLDER_POSTS.map((post, i) => (
              <div className="col-lg-4 col-md-6 th_fade_anim" data-delay={DELAYS[i]} key={i}>
                <div className="blog-card" style={{ padding: "30px", border: "1px solid #E2E5EE", borderRadius: "16px" }}>
                  <div className="blog-content" style={{ padding: 0 }}>
                    <div className="blog-meta">
                      <span>Category: {post.category}</span>
                    </div>
                    <h2 className="box-title">Blog post coming soon</h2>
                    <p className="blog-text">Articles in this category will appear here once they are published.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
