import { countries } from "@/lib/countries-data";

const DELAYS = [".3", ".5", ".7"];

// Light, premium hero backdrop (replaces the photo hero on country pages).
const HERO_BG: React.CSSProperties = {
  background:
    "radial-gradient(1000px 400px at 85% 0%, rgba(79,70,229,0.10), transparent 60%), radial-gradient(800px 360px at 0% 100%, rgba(20,184,166,0.10), transparent 60%), linear-gradient(180deg, #FFFFFF 0%, #F3F5FB 100%)",
  borderBottom: "1px solid #E2E5EE",
};

export default function Countries() {
  return (
    <>
      {/*==============================
    Breadcumb
============================== */}
      <div className="breadcumb-wrapper " style={HERO_BG}>
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="breadcumb-content" style={{ "--space": "45px" } as React.CSSProperties}>
                <span className="sub-title text-theme"><img src="/assets/img/icon/subtitle-icon1-6.svg" alt="img" />Countries</span>
                <h1 className="breadcumb-title">Country Guides</h1>
                <ul className="breadcumb-menu">
                  <li><a href="/">Home</a></li>
                  <li>Countries</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*==============================
Countries Area
==============================*/}
      <section className="space-top space-extra-bottom" id="countries-sec">
        <div className="container">
          <div className="row gy-40">
            {countries.map((country, i) => (
              <div className="col-lg-4 col-md-6 th_fade_anim" data-delay={DELAYS[i % 3]} key={country.slug}>
                <a href={`/countries/${country.slug}`} className="country-card" aria-label={`${country.name} teaching guide`}>
                  <div className="country-card__top">
                    <span className="country-card__flag" aria-hidden="true">{country.flagEmoji}</span>
                    <span className="country-card__code">{country.code}</span>
                  </div>
                  <h2 className="country-card__name">{country.name}</h2>
                  <div className="country-card__pills">
                    {country.statBadges.map((b) => (
                      <span className="country-card__pill" key={b.label}>{b.value}</span>
                    ))}
                  </div>
                  <span className="country-card__cta">VIEW GUIDE <i className="fas fa-arrow-right"></i></span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
