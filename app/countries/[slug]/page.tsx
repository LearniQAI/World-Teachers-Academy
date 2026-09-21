import { notFound } from "next/navigation";
import { countries, getCountryBySlug } from "@/lib/countries-data";
import type { Block, Tone } from "@/lib/countries-data";
import CountryFlag from "@/components/layout/CountryFlag";
import { countryMedia } from "@/lib/country-media";

const INDIGO = "#4F46E5";
const ORANGE = "#F97316";
const TEAL = "#14B8A6";
const INK_NAVY = "#0F172A";
const PAPER_DIM = "#6B7280";
const BORDER = "#E2E5EE";
const SOFT = "#F1F4F9";

// Light, premium hero backdrop (replaces the photo hero on country pages).
const HERO_BG: React.CSSProperties = {
  background:
    "radial-gradient(1000px 400px at 85% 0%, rgba(79,70,229,0.10), transparent 60%), radial-gradient(800px 360px at 0% 100%, rgba(20,184,166,0.10), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F3F5FB 100%)",
  borderBottom: "1px solid #E2E5EE",
};

const TONES: Record<Tone, { accent: string; bg: string; text: string }> = {
  success: { accent: "#059669", bg: "#ECFDF5", text: "#047857" },
  info: { accent: INDIGO, bg: "#EEF0FF", text: INDIGO },
  warn: { accent: ORANGE, bg: "#FFF4EA", text: "#9A3412" },
  danger: { accent: "#DC2626", bg: "#FEF2F2", text: "#B91C1C" },
  neutral: { accent: "#94A3B8", bg: SOFT, text: INK_NAVY },
};

export function generateStaticParams() {
  return countries.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);
  return country ? { title: `${country.heading ?? `Teaching in ${country.name}`} | World Teachers Academy`, description: country.tagline } : {};
}

function SectionBar({ title, color }: { title: string; color: string }) {
  return (
    <div style={{ background: color, color: "#fff", padding: "14px 22px", borderRadius: "8px", marginBottom: "24px" }}>
      <h2 style={{ fontSize: "16px", margin: 0, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</h2>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "text":
      return <p style={{ color: INK_NAVY, marginBottom: "18px" }}>{block.text}</p>;
    case "list":
      return (
        <ul style={{ paddingLeft: "20px", marginBottom: "18px" }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ marginBottom: "8px", color: INK_NAVY }}>
              {item.label && <strong>{item.label}</strong>}
              {item.label ? " — " : ""}
              {item.text}
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol style={{ listStyle: "none", padding: 0, marginBottom: "18px" }}>
          {block.items.map((s, i) => (
            <li key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", marginBottom: "12px" }}>
              <span
                style={{
                  flex: "0 0 32px",
                  height: "32px",
                  borderRadius: "6px",
                  background: INDIGO,
                  color: "#fff",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
              <span style={{ color: INK_NAVY, paddingTop: "4px" }}>
                <strong>{s.label}</strong>
                {s.text && <> — {s.text}</>}
              </span>
            </li>
          ))}
        </ol>
      );
    case "cards":
      return (
        <div className="row gy-3" style={{ marginBottom: "18px" }}>
          {block.items.map((c, i) => {
            const tone = TONES[c.tone ?? "neutral"];
            const colClass = block.items.length === 3 ? "col-md-4" : block.items.length === 1 ? "col-12" : "col-md-6";
            return (
              <div className={colClass} key={i}>
                <div
                  style={{
                    height: "100%",
                    border: `1px solid ${BORDER}`,
                    borderTop: `4px solid ${tone.accent}`,
                    borderRadius: "10px",
                    padding: "18px",
                    background: "#fff",
                  }}
                >
                  <h4 style={{ fontSize: "16px", color: INK_NAVY, marginBottom: "8px" }}>{c.title}</h4>
                  {c.badge && (
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: tone.text,
                        background: tone.bg,
                        padding: "3px 10px",
                        borderRadius: "999px",
                        marginBottom: "10px",
                      }}
                    >
                      {c.badge}
                    </span>
                  )}
                  <p style={{ fontSize: "14px", color: PAPER_DIM, margin: 0, whiteSpace: "pre-line" }}>{c.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    case "table":
      return (
        <div style={{ overflowX: "auto", border: `1px solid ${BORDER}`, borderRadius: "10px", marginBottom: "18px" }}>
          <table style={{ width: "100%", minWidth: "560px", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    style={{ background: INK_NAVY, color: "#fff", padding: "12px 16px", textAlign: "left", fontSize: "12px", letterSpacing: "0.05em", verticalAlign: "top" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} style={{ background: i % 2 ? SOFT : "#fff" }}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        padding: "12px 16px",
                        color: INK_NAVY,
                        borderTop: `1px solid ${BORDER}`,
                        fontWeight: j === 0 ? 700 : 400,
                        verticalAlign: "top",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "quote":
      return <PullQuote text={block.text} source={block.attribution} />;
    case "callout": {
      const tone = TONES[block.tone];
      return (
        <div
          style={{
            background: tone.bg,
            borderLeft: `4px solid ${tone.accent}`,
            borderRadius: "8px",
            padding: "18px 22px",
            marginBottom: "18px",
          }}
        >
          {block.title && <h4 style={{ fontSize: "16px", color: tone.text, marginBottom: "8px" }}>{block.title}</h4>}
          <p style={{ margin: 0, color: INK_NAVY, fontWeight: block.title ? 400 : 700 }}>{block.text}</p>
        </div>
      );
    }
  }
}

function PullQuote({ text, source = "FROM THE VIDEO SCRIPT" }: { text: string; source?: string }) {
  return (
    <blockquote
      style={{
        background: SOFT,
        borderLeft: `5px solid ${TEAL}`,
        borderRadius: "8px",
        padding: "26px 30px",
        margin: "0 0 32px",
        position: "relative",
      }}
    >
      <img src="/assets/img/icon/quote5.svg" alt="" style={{ width: "34px", marginBottom: "12px", opacity: 0.85 }} />
      <p style={{ fontSize: "20px", fontStyle: "italic", color: INK_NAVY, lineHeight: 1.5, margin: "0 0 14px" }}>“{text}”</p>
      <cite style={{ fontStyle: "normal", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: TEAL }}>
        {source}
      </cite>
    </blockquote>
  );
}

export default async function CountryDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const country = getCountryBySlug(slug);

  if (!country) {
    notFound();
  }

  const { reading, videoScript, debateAudio } = country;
  const media = countryMedia[country.slug];

  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <div className="breadcumb-wrapper " style={HERO_BG}>
        <div className="container">
          <div className="row">
            <div className="col-lg-9">
              <div className="breadcumb-content" style={{ "--space": "45px" } as React.CSSProperties}>
                <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Country Guide</span>
                <h1 className="breadcumb-title"><CountryFlag country={country} height={32} /> {country.heading ?? `Teaching in ${country.name}`}</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li><a href="/countries">Countries</a></li>
                  <li>{country.name}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="space-top space-extra-bottom overflow-hidden">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-9 col-lg-10">
              {/* Intro: tagline, stat badges, guide contents */}
              <p style={{ fontSize: "20px", color: INK_NAVY, marginBottom: "28px" }}>{country.tagline}</p>

              <div className="row gy-3" style={{ marginBottom: "36px" }}>
                {country.statBadges.map((b, i) => (
                  <div className={country.statBadges.length === 4 ? "col-md-6 col-lg-3" : "col-md-4"} key={b.label}>
                    <div style={{ background: SOFT, border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "20px", textAlign: "center", height: "100%" }}>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: [INDIGO, TEAL, ORANGE][i % 3] }}>{b.value}</div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: PAPER_DIM, letterSpacing: "0.04em", textTransform: "uppercase" }}>{b.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {country.guideContents.length > 0 && (
                <>
                  <h3 style={{ fontSize: "22px", color: INK_NAVY, marginBottom: "14px" }}>What&apos;s In This Guide</h3>
                  <ul style={{ paddingLeft: "20px", marginBottom: "48px" }}>
                    {country.guideContents.map((g) => {
                      const [label, ...rest] = g.split(" — ");
                      return (
                        <li key={g} style={{ marginBottom: "6px", color: INK_NAVY }}>
                          <strong>{label}</strong> — {rest.join(" — ")}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              {/* Video + debate audio players */}
              {media && (
                <div style={{ marginBottom: "48px" }}>
                  {media.youtubeId && (
                    <div style={{ marginBottom: media.audio ? "32px" : 0 }}>
                      <SectionBar title={`Watch — Teaching in ${country.name}`} color={INDIGO} />
                      <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: "12px", overflow: "hidden", border: `1px solid ${BORDER}`, background: INK_NAVY }}>
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${media.youtubeId}`}
                          title={`Teaching in ${country.name} — video`}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                        />
                      </div>
                    </div>
                  )}
                  {media.audio && (
                    <div>
                      <SectionBar title={`Listen — Debate Audio: ${country.name}`} color={TEAL} />
                      <iframe
                        src={`https://www.buzzsprout.com/${media.audio.show}/episodes/${media.audio.id}-${media.audio.slug}?client_source=small_player&iframe=true`}
                        title={`Teaching in ${country.name} — debate audio`}
                        loading="lazy"
                        width="100%"
                        height="200"
                        scrolling="no"
                        style={{ border: 0, borderRadius: "12px", display: "block" }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Reading */}
              {reading.quickFacts.length > 0 && (
                <>
                  <SectionBar title={`Reading — ${country.name} at a glance`} color={INK_NAVY} />
                  <h3 style={{ fontSize: "20px", color: INDIGO, marginBottom: "12px" }}>Quick Facts</h3>
                  <ul style={{ paddingLeft: "20px", marginBottom: "32px" }}>
                    {reading.quickFacts.map((f) => (
                      <li key={f} style={{ marginBottom: "8px", color: INK_NAVY }}>{f}</li>
                    ))}
                  </ul>
                </>
              )}

              {reading.sections.map((section, i) => (
                <div key={i}>
                  <div style={{ marginBottom: "32px" }}>
                    {section.heading && <h3 style={{ fontSize: "20px", color: INDIGO, marginBottom: "14px" }}>{section.heading}</h3>}
                    {section.blocks.map((block, j) => (
                      <BlockView block={block} key={j} />
                    ))}
                  </div>
                  {reading.pullQuote && i === reading.pullQuoteAfter && <PullQuote text={reading.pullQuote} />}
                </div>
              ))}

              {/* Do's & Don'ts */}
              {country.doAndDont.length > 0 && (
              <>
              <h3 style={{ fontSize: "20px", color: INDIGO, marginBottom: "14px" }}>{country.doAndDontHeading ?? <>Rules: Do&apos;s &amp; Don&apos;ts</>}</h3>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden", marginBottom: "56px" }}>
                <div className="row g-0" style={{ fontWeight: 700 }}>
                  <div className="col-6" style={{ background: "#ECFDF5", color: "#059669", padding: "12px 18px" }}>✓ DO</div>
                  <div className="col-6" style={{ background: "#FEF2F2", color: "#DC2626", padding: "12px 18px" }}>✗ DON&apos;T</div>
                </div>
                {country.doAndDont.map((row, i) => (
                  <div key={i}>
                    {row.group && (
                      <div style={{ background: INK_NAVY, color: "#fff", padding: "10px 18px", fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", borderTop: `1px solid ${BORDER}` }}>
                        {row.group}
                      </div>
                    )}
                    <div className="row g-0" style={{ background: i % 2 ? SOFT : "#fff", borderTop: `1px solid ${BORDER}` }}>
                      <div className="col-6" style={{ padding: "14px 18px", fontSize: "14px", color: INK_NAVY }}>{row.do}</div>
                      <div className="col-6" style={{ padding: "14px 18px", fontSize: "14px", color: INK_NAVY, borderLeft: `1px solid ${BORDER}` }}>{row.dont}</div>
                    </div>
                  </div>
                ))}
              </div>
              </>
              )}

              {/* Video Script */}
              {videoScript && (
              <>
              <SectionBar title={`Video Script — “${videoScript.title}”`} color={INDIGO} />
              <div style={{ marginBottom: "56px" }}>
                {videoScript.scenes.map((scene, i) => (
                  <div key={i} style={{ marginBottom: "22px" }}>
                    <p style={{ fontStyle: "italic", color: "#0F9F8F", fontSize: "14px", marginBottom: "10px" }}>[SCENE: {scene.direction}]</p>
                    {scene.lines.map((line, j) => {
                      const isNarrator = line.speaker.startsWith("NARRATOR");
                      return (
                        <div
                          key={j}
                          style={{
                            borderLeft: `3px solid ${isNarrator ? INK_NAVY : ORANGE}`,
                            paddingLeft: "16px",
                            marginBottom: "12px",
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: "13px", letterSpacing: "0.04em", color: isNarrator ? INK_NAVY : ORANGE }}>
                            {line.speaker}:
                          </div>
                          <div style={{ color: INK_NAVY, fontWeight: isNarrator ? 400 : 500 }}>{line.text}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              </>
              )}

              {/* Debate Audio */}
              {debateAudio && (
              <>
              <SectionBar title={`Debate Audio — “${debateAudio.title}”`} color={TEAL} />
              <p style={{ fontStyle: "italic", color: PAPER_DIM, marginBottom: "22px" }}>
                Hosts: {debateAudio.host1} and {debateAudio.host2}
              </p>
              <div style={{ marginBottom: "48px" }}>
                {debateAudio.exchange.map((turn, i) => {
                  // Host 1 (the sceptic) on the left, host 2 (makes the case) on the right.
                  const isHost2 = debateAudio.host2.startsWith(turn.speaker);
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: isHost2 ? "flex-end" : "flex-start", marginBottom: "14px" }}>
                      <div
                        style={{
                          maxWidth: "82%",
                          background: isHost2 ? "#EEF0FF" : SOFT,
                          border: `1px solid ${isHost2 ? "#D9DDFB" : BORDER}`,
                          borderRadius: isHost2 ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                          padding: "12px 16px",
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: "12px", letterSpacing: "0.06em", color: isHost2 ? INDIGO : TEAL, marginBottom: "4px" }}>
                          {turn.speaker}
                        </div>
                        <div style={{ color: INK_NAVY, fontSize: "15px" }}>{turn.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </>
              )}

              {/* Closing equation */}
              <div style={{ borderTop: `2px solid ${TEAL}`, paddingTop: "28px", marginBottom: "48px" }}>
                <h3 style={{ fontSize: "22px", color: INDIGO, marginBottom: "12px" }}>{country.closingEquation.heading}</h3>
                <p style={{ color: INK_NAVY, fontWeight: 600, marginBottom: 0 }}>{country.closingEquation.content}</p>
              </div>

              {/* Job Portal CTA */}
              <div style={{ background: INK_NAVY, borderRadius: "12px", padding: "40px 24px", textAlign: "center" }}>
                <h3 style={{ color: "#fff", fontSize: "26px", marginBottom: "10px" }}>{country.jobPortalCTA.heading}</h3>
                <p style={{ color: "#CBD5E1", marginBottom: "24px" }}>{country.jobPortalCTA.text}</p>
                <a href={country.jobPortalCTA.href} className="th-btn" style={{ background: ORANGE, borderColor: ORANGE }}>
                  → {country.jobPortalCTA.buttonLabel}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
