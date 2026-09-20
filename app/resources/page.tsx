import { resources } from "@/lib/resources-data";
import { truncateAtWord } from "@/lib/html-text";

const READ_MORE_ICON = (
  <svg className="ms-2" width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5264 0C7.5264 0.6962 8.21633 1.738 8.9138 2.61293C9.81193 3.7394 10.8838 4.72347 12.1137 5.4748C13.0351 6.0374 14.154 6.57747 15.0528 6.57747M7.5264 13.1712C7.5264 12.475 8.21633 11.4332 8.9138 10.5583C9.81193 9.43187 10.8838 8.44773 12.1137 7.6964C13.0351 7.1338 14.154 6.59373 15.0528 6.59373M15.0528 6.5856H0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const DELAYS = [".3", ".5", ".7", ".3", ".5", ".7", ".3"];

export default function Resources() {
  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <img
        src="/assets/Resources-herosection.jpg"
        alt="World Teachers Academy Resources"
        style={{ display: "block", width: "100%", height: "auto" }}
      />
      {/*==============================
Blog Area
==============================*/}
      <section className="space-top space-extra-bottom" id="blog-sec">
        <div className="container">
          <div className="row gy-40">
            {resources.map((resource, i) => (
              <div className="col-lg-4 col-md-6 th_fade_anim" data-delay={DELAYS[i]} key={resource.slug}>
                <div className="blog-card" style={{ padding: "30px", border: "1px solid #E2E5EE", borderRadius: "16px" }}>
                  <div className="blog-content" style={{ padding: 0 }}>
                    <div className="blog-meta">
                      <a href="/resources">{resource.category}</a>
                    </div>
                    <h2 className="box-title"><a href={`/resources/${resource.slug}`}>{resource.title}</a></h2>
                    <p className="blog-text">{truncateAtWord(resource.summary, 150)}</p>
                    <a href={`/resources/${resource.slug}`} className="th-btn style4 btn-sm">READ MORE{READ_MORE_ICON}</a>
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
