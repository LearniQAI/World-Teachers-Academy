// Shared hero for content pages (About, Support, FAQs, Privacy, Terms) —
// same breadcumb-wrapper treatment already used on the Countries and
// Resources detail pages, extended with an optional subhead paragraph.
const HERO_BG: React.CSSProperties = {
  background:
    "radial-gradient(1000px 400px at 85% 0%, rgba(79,70,229,0.10), transparent 60%), radial-gradient(800px 360px at 0% 100%, rgba(20,184,166,0.10), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F3F5FB 100%)",
  borderBottom: "1px solid #E2E5EE",
};

export default function PageHero({
  eyebrow,
  title,
  subhead,
  crumb,
}: {
  eyebrow: string;
  title: string;
  subhead?: string;
  crumb: string;
}) {
  return (
    <div className="breadcumb-wrapper " style={HERO_BG}>
      <div className="container">
        <div className="row">
          <div className="col-lg-9">
            <div className="breadcumb-content" style={{ "--space": "45px" } as React.CSSProperties}>
              <span className="sub-title text-theme">
                <img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />
                {eyebrow}
              </span>
              <h1 className="breadcumb-title">{title}</h1>
              {subhead && (
                <p style={{ fontSize: "18px", color: "#6B7280", maxWidth: "720px", marginTop: "18px" }}>{subhead}</p>
              )}
              <ul className="breadcumb-menu">
                <li><a href="/">Home</a></li>
                <li>{crumb}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
