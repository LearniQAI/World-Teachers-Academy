import { notFound } from "next/navigation";
import { getResourceBySlug, type ResourceSection } from "@/lib/resources-data";

const INDIGO = "#4F46E5";
const TEAL = "#14B8A6";
const INK_NAVY = "#0F172A";
const PAPER_DIM = "#6B7280";
const BORDER = "#E2E5EE";
const DONT_RED = "#E01717";

// TODO: once real videos exist for these guides, replace this pending state
// with the actual embed — do NOT wire a fake/placeholder video URL before then.
function VideoPendingBox() {
  return (
    <div
      style={{
        border: `1px dashed ${BORDER}`,
        borderRadius: "10px",
        padding: "28px",
        textAlign: "center",
        color: PAPER_DIM,
        background: "#FAFBFF",
      }}
    >
      <i className="fal fa-video" style={{ fontSize: "22px", display: "block", marginBottom: "8px" }}></i>
      Video coming soon
    </div>
  );
}

function Section({ section }: { section: ResourceSection }) {
  const paragraphsBefore = section.paragraphsPosition !== "after" ? section.paragraphs : undefined;
  const paragraphsAfter = section.paragraphsPosition === "after" ? section.paragraphs : undefined;

  return (
    <div style={{ marginBottom: "40px" }}>
      <h3 style={{ fontSize: "20px", color: INK_NAVY, marginBottom: "14px" }}>{section.heading}</h3>

      {paragraphsBefore?.map((p, i) => (
        <p key={i} style={{ color: INK_NAVY, marginBottom: "14px" }}>
          {p}
        </p>
      ))}

      {section.items && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "14px" }}>
          {section.items.map((item) => (
            <div key={item.label} style={{ border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: item.subtitle ? "2px" : "8px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: INK_NAVY, margin: 0 }}>{item.label}</h4>
                {item.tag && (
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#fff",
                      background: INDIGO,
                      padding: "3px 10px",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
              {item.subtitle && (
                <p style={{ fontStyle: "italic", color: PAPER_DIM, fontSize: "14px", margin: "0 0 8px" }}>{item.subtitle}</p>
              )}
              <p style={{ color: INK_NAVY, margin: 0, fontSize: "15px" }}>{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {section.bullets && (
        <ul className="checklist style3" style={{ marginBottom: "14px" }}>
          {section.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      {paragraphsAfter?.map((p, i) => (
        <p key={i} style={{ color: INK_NAVY, marginBottom: "14px" }}>
          {p}
        </p>
      ))}

      {section.callout && (
        <div
          style={{
            borderLeft: `3px solid ${TEAL}`,
            background: "#FAFBFF",
            borderRadius: "0 10px 10px 0",
            padding: "16px 20px",
            marginTop: "10px",
          }}
        >
          {section.callout.heading && (
            <strong style={{ display: "block", color: INK_NAVY, marginBottom: "4px" }}>{section.callout.heading}</strong>
          )}
          <p style={{ margin: 0, color: INK_NAVY }}>{section.callout.text}</p>
          {section.callout.contact && (
            <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "14px" }}>
              {section.callout.contact.email && (
                <a href={`mailto:${section.callout.contact.email}`} style={{ color: INDIGO }}>
                  <i className="fal fa-envelope me-2"></i>
                  {section.callout.contact.email}
                </a>
              )}
              {section.callout.contact.whatsapp && (
                <a
                  href={`https://wa.me/${section.callout.contact.whatsapp.replace(/[^\d]/g, "")}`}
                  style={{ color: INDIGO }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp me-2"></i>
                  {section.callout.contact.whatsapp}
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ResourceDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);

  if (!resource) {
    notFound();
  }

  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <div className="breadcumb-wrapper " data-bg-src="/assets/img/bg/breadcumb-bg.png">
        <div className="container">
          <div className="row">
            <div className="col-lg-9">
              <div className="breadcumb-content">
                <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />{resource.category}</span>
                <h1 className="breadcumb-title">{resource.title}</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li><a href="/resources">Resources</a></li>
                  <li>{resource.title}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*==============================
    Resource Details
============================== */}
      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-9 col-lg-10">
              <p style={{ fontSize: "18px", color: INK_NAVY, lineHeight: 1.6, marginBottom: "40px" }}>
                {resource.summary}
              </p>

              {resource.videos.map((video, i) => (
                <div key={i} style={{ marginBottom: "40px" }}>
                  <h3 style={{ fontSize: "18px", color: INK_NAVY, marginBottom: "10px" }}>
                    <i className="fal fa-play-circle me-2" style={{ color: INDIGO }}></i>
                    Watch: {video.label}
                  </h3>
                  <p style={{ color: PAPER_DIM, marginBottom: "14px" }}>{video.description}</p>
                  {video.youtubeId ? (
                    <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: "10px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                        title={video.label}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                      />
                    </div>
                  ) : (
                    <VideoPendingBox />
                  )}
                  {video.afterBullets && (
                    <ul className="checklist style3" style={{ marginTop: "16px" }}>
                      {video.afterBullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {resource.sections.map((section, i) => (
                <Section key={i} section={section} />
              ))}

              <h3 style={{ fontSize: "20px", color: INK_NAVY, marginBottom: "16px" }}>Do&apos;s &amp; Don&apos;ts</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
                <div className="d-none d-md-flex" style={{ background: "#FAFBFF" }}>
                  <div style={{ flex: 1, padding: "12px 20px", fontWeight: 700, color: TEAL }}>
                    <i className="fas fa-check me-2"></i>DO
                  </div>
                  <div style={{ flex: 1, padding: "12px 20px", fontWeight: 700, color: DONT_RED, borderLeft: `1px solid ${BORDER}` }}>
                    <i className="fas fa-times me-2"></i>DON&apos;T
                  </div>
                </div>
                {resource.doAndDont.map((pair, i) => (
                  <div className="d-flex flex-column flex-md-row" key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
                    <div style={{ flex: 1, padding: "16px 20px", color: INK_NAVY }}>{pair.do}</div>
                    <div style={{ flex: 1, padding: "16px 20px", color: INK_NAVY, borderLeft: `1px solid ${BORDER}` }}>{pair.dont}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
